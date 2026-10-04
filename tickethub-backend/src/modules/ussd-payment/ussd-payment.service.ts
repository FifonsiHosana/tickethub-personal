import axios from 'axios';
import crypto from 'crypto';
import type {
  PaymentWebhook,
  PaystackPaymentFields,
} from './ussd-payment.types.js';
import config from '@/config/config.js';
import logger from '@/utils/logger/index.js';
import { isTransactionProcessed, sendTicket } from './ussd-payment.utils.js';
import { FinanceService } from '../finance/finance.service.js';
import { db } from '@/db/client.js';
import {
  events,
  eventTickets,
  ticketOrderItems,
  tickets,
  ticketTypes,
} from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';

const PAYSTACK_CHARGE_URL = 'https://api.paystack.co/charge';
const PAYSTACK_INITIALIZE_URL =
  'https://api.paystack.co/transaction/initialize';
const PENDING_CHARGE_CHECK_DELAY_MS = 10_000;

type PaystackChargeStatus =
  'success' | 'pay_offline' | 'pending' | 'send_pin' | 'send_otp' | 'failed';

type PaystackChargeResult = {
  status: boolean;
  message?: string;
  data?: {
    status?: PaystackChargeStatus;
    reference?: string;
    display_text?: string;
    message?: string;
  };
};

const paystackHeaders = () => ({
  Authorization: `Bearer ${config.payment.paystack_api_key}`,
  'Content-Type': 'application/json',
});

const wait = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function buildRetryReference(orderId: number) {
  return `${crypto.randomBytes(5).toString('hex')}`;
}

function buildRetryMessage(authorizationUrl: string) {
  return (
    'Your TicketHub mobile money payment could not be processed. ' +
    `Retry securely here: ${authorizationUrl}. ` +
    'If you already approved payment, please ignore this message.'
  );
}

async function checkPendingCharge(reference: string) {
  await wait(PENDING_CHARGE_CHECK_DELAY_MS);

  const response = await axios.get(`${PAYSTACK_CHARGE_URL}/${reference}`, {
    headers: paystackHeaders(),
  });

  logger.info(
    { reference, chargeStatus: response.data?.data?.status },
    'Paystack pending charge checked',
  );

  return response.data as PaystackChargeResult;
}

async function createAndSendRetryLink(fields: PaystackPaymentFields) {
  const { authorization_url, reference } = await createPayLink({
    email: fields.email,
    amount: fields.amount,
    orderId: fields.metadata.orderId,
    phoneNumber: fields.metadata.phoneNumber,
    totalQuantity: fields.metadata.totalQuantity,
  });

  await sendTicket(
    fields.metadata.phoneNumber,
    buildRetryMessage(authorization_url),
  );

  return { authorizationUrl: authorization_url, reference };
}

async function handleChargeResult(
  result: PaystackChargeResult,
  fields: PaystackPaymentFields,
) {
  const status = result.data?.status;
  const reference = result.data?.reference ?? fields.reference;

  logger.info(
    {
      orderId: fields.metadata.orderId,
      reference,
      chargeStatus: status,
      displayText: result.data?.display_text,
    },
    'Paystack charge response received',
  );

  // if (status === 'pay_offline') {
  //   await sendTicket(
  //     fields.metadata.phoneNumber,
  //     result.data?.display_text ??
  //       'Payment request sent. Check your mobile money approvals and authorize within 3 minutes.',
  //   );
  //   return result;
  // }

  if (status === 'pending' && reference) {
    return checkPendingCharge(reference);
  }

  if (status === 'send_pin' || status === 'send_otp') {
    logger.warn(
      { orderId: fields.metadata.orderId, reference, chargeStatus: status },
      'Paystack requested an interactive credential outside the USSD flow',
    );
    return result;
  }

  if (status === 'failed') {
    await createAndSendRetryLink(fields);
  }

  return result;
}

export const initiatePayment = async (fields: PaystackPaymentFields) => {
  const chargeFields: PaystackPaymentFields = {
    ...fields,
    mobile_money: {
      ...fields.mobile_money,
      phone: fields.mobile_money.phone,
    },
    metadata: {
      ...fields.metadata,
      phoneNumber: fields.metadata.phoneNumber,
      source: fields.metadata.source ?? 'ussd_direct_charge',
    },
  };

  try {
    const response = await axios.post(PAYSTACK_CHARGE_URL, chargeFields, {
      headers: paystackHeaders(),
    });

    return handleChargeResult(
      response.data as PaystackChargeResult,
      chargeFields,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const body = error.response?.data;

      logger.error(
        {
          status: error.response?.status,
          body,
          orderId: chargeFields.metadata.orderId,
          reference: chargeFields.reference,
        },
        'Paystack charge failed',
      );

      const isUnprocessed =
        error.response?.status === 400 &&
        body?.code === 'unprocessed_transaction' &&
        body?.data?.status === 'failed';

      if (isUnprocessed) {
        const retry = await createAndSendRetryLink(chargeFields);
        return {
          handled: true,
          reference: body.data.reference,
          retryReference: retry.reference,
          retryUrl: retry.authorizationUrl,
        };
      }
    }

    throw error;
  }
};

export const createPayLink = async (opts: {
  email: string;
  amount: number;
  orderId: number;
  phoneNumber: string;
  totalQuantity: number;
}) => {
  const retryReference = buildRetryReference(opts.orderId);
  const response = await axios.post(
    PAYSTACK_INITIALIZE_URL,
    JSON.stringify({
      email: opts.email,
      amount: opts.amount,
      currency: 'GHS',
      channels: ['mobile_money'],
      reference: retryReference,
      callback_url: `${config.appUrl}/success?reference=${retryReference}`,
      metadata: {
        phoneNumber: opts.phoneNumber,
        orderId: opts.orderId,
        ussd: true,
        source: 'ussd_retry_link',
        totalQuantity: opts.totalQuantity,
      },
    }),
    {
      headers: paystackHeaders(),
    },
  );
  return response.data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

const handleError = (label: string, error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.log(`${label}:`, error.response?.data ?? error.message);
    return error.response?.data ?? { status: false, message: error.message };
  }
  throw error;
};

/** Submits the OTP / voucher code for a charge that returned `send_otp`. */
export const paystackOtp = async (otp: string, reference: string) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/charge/submit_otp',
      { otp, reference },
      { headers: paystackHeaders() },
    );
    return response.data;
  } catch (error) {
    return handleError('Paystack OTP error', error);
  }
};

export const paymentComplete = async (fields: PaymentWebhook) => {
  const financeService = new FinanceService();

  if (fields.event !== 'charge.success') return;

  const metadata = fields.data.metadata ?? {};
  const orderId = Number(metadata.orderId);

  if (!orderId) {
    throw new Error('Missing orderId in Paystack USSD webhook metadata');
  }

  logger.info(
    { orderId, reference: fields.data.reference, source: metadata.source },
    'Processing Paystack USSD payment completion',
  );

  const ticketItems = await db
    .select({
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      ticketType: ticketTypes.name,
      ticketName: tickets.name,
      eventName: events.title,
      qrCodeUrl: ticketOrderItems.qrCodeUrl,
    })
    .from(ticketOrderItems)
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .where(eq(ticketOrderItems.orderId, orderId));

  const totalQuantity = ticketItems.length;
  const paymentRef = fields.data.reference;
  const currency = fields.data.currency;
  const email = fields.data.customer.email;
  const amount = fields.data.amount / 100;
  const PROVIDER = 'paystack';

  if (!paymentRef) {
    throw new Error('Missing payment reference in Paystack webhook');
  }

  const alreadyProcessed = await isTransactionProcessed(paymentRef);

  if (alreadyProcessed) return;

  await financeService.processPurchase(
    orderId,
    paymentRef,
    amount,
    currency,
    PROVIDER,
    email,
    totalQuantity,
  );
};
