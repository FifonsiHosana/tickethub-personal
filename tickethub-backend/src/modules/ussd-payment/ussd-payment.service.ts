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
  ticketConfigurations,
  ticketOrderItems,
  ticketOrders,
  tickets,
  ticketTypes,
} from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';

export const initiatePayment = async (fields: PaystackPaymentFields) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/charge',
      { ...fields },
      {
        headers: { Authorization: `Bearer ${config.payment.paystack_api_key}` },
      },
    );

    console.log('Paystack charge response', response.data); // comma, not template string
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const body = error.response?.data;

      console.error('Paystack charge failed', {
        status: error.response?.status,
        body,
        orderId: fields.metadata?.orderId,
      });

      const isUnprocessed =
        error.response?.status === 400 &&
        body?.code === 'unprocessed_transaction' &&
        body?.data?.status === 'failed';

      const chargeUnsuccessfulMessage =
        'Your payment could not be processed. Here is a link to your to retry payment.';

      if (isUnprocessed) {
        try {
          const { authorization_url, reference, access_code } =
            await createPayLink({
              email: fields.email,
              amount: fields.amount,
              orderId: fields.metadata?.orderId,
              phoneNumber: fields.metadata?.phoneNumber,
              totalQuantity: fields.metadata?.totalQuantity,
            });

          // await sendTicket(
          //   fields.metadata?.phoneNumber,
          //   `If you haven't received the payment prompt, please complete your payment here:\n${authorization_url}.\n
          //    NOTE:if you have already recived the prompt and paid, please ignore this message.`,
          // );
          // optionally save `reference` against the order
        } catch (linkError) {
          console.error('Failed to create/send pay link', {
            orderId: fields.metadata?.orderId,
            totalQuantity: fields.metadata?.totalQuantity,
            linkError,
          });
        }

        return { handled: true, reference: body.data.reference };
      }
    }

    throw error;
  }
};

// export const paystackOtp = async (otp: string, reference: string) => {
//   try {
//     const response = await axios.post(
//       'https://api.paystack.co/charge/submit_otp',
//       { otp, reference },
//       {
//         headers: {
//           Authorization: `Bearer ${config.payment.paystack_api_key}`,
//         },
//       },
//     );
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.log('Paystack OTP error:', error.response?.data ?? error.message);
//       return error.response?.data ?? { status: false, message: error.message };
//     }
//     throw error;
//   }
// };

export const createPayLink = async (opts: {
  email: string;
  amount: number;
  orderId: number;
  phoneNumber: string;
  totalQuantity: number;
}) => {
  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    JSON.stringify({
      email: opts.email,
      amount: opts.amount,

      metadata: {
        phoneNumber: opts.phoneNumber,
        orderId: opts.orderId as number,
        ussd: true,
        totalQuantity: opts.totalQuantity as number,
      },
    }),
    {
      headers: {
        Authorization: `Bearer ${config.payment.paystack_api_key}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data.data as {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

const paystackHeaders = () => ({
  Authorization: `Bearer ${config.payment.paystack_api_key}`,
  'Content-Type': 'application/json',
});

const handleError = (label: string, error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.log(`${label}:`, error.response?.data ?? error.message);
    return error.response?.data ?? { status: false, message: error.message };
  }
  throw error;
};

// /**
//  * Starts a mobile money charge.
//  * Response shape: { status, message, data: { status, reference, display_text } }
//  * data.status: 'send_otp' | 'pay_offline' | 'pending' | 'success' | 'failed'
//  */
// export const initiatePayment = async (fields: PaystackPaymentFields) => {
//   try {
//     const response = await axios.post(
//       'https://api.paystack.co/charge',
//       { ...fields },
//       { headers: paystackHeaders() },
//     );
//     console.log(`Paystack charge ${response.data?.data?.status}`);
//     return response.data;
//   } catch (error) {
//     return handleError('Paystack charge error', error);
//   }
// };

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

  const orderId = Number(fields.data.metadata.orderId);
  console.log('paystack fields', JSON.stringify(fields));

  // const ticketItems = await db
  //   .select({
  //     ticketIdentifier: ticketOrderItems.ticketIdentifier,
  //     ticketType: eventTickets.ticketTypeId,
  //     name: events.title,
  //     quantity: ticketOrders.quantity,
  //   })
  //   .from(ticketOrderItems)
  //   .innerJoin(tickets, eq(tickets.id, ticketOrderItems.eventTicketId))
  //   .innerJoin(ticketOrders, eq(ticketOrders.id, ticketOrderItems.orderId))
  //   .innerJoin(
  //     ticketConfigurations,
  //     eq(ticketOrderItems.id, ticketConfigurations.id),
  //   )
  //   .innerJoin(eventTickets, eq(tickets.eventId, eventTickets.id))
  //   .innerJoin(events, eq(eventTickets.id, events.id))
  //   .where(eq(ticketOrderItems.orderId, orderId));
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

  console.log('All ticketItems', ticketItems);

  const totalQuantity = Number(ticketItems.length);

  console.log('total quantity ticketitems', totalQuantity);

  const phoneNumber = fields.data.metadata.phoneNumber;

  const message = ticketItems
    .map((ticket, index) =>
      `
TICKET ${index + 1}

${ticket.ticketName}

Ticket ID: ${ticket.ticketIdentifier}
Ticket Type: ${ticket.ticketType}
Quantity: ${totalQuantity}
      `.trim(),
    )
    .join('\n\n--------------------\n\n');

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
    totalQuantity as number,
  );

  // await sendTicket(phoneNumber, message);
};

const checkStatus = async () => {
  //Help clients that paid and wanna know why they didn't get their tickets
  //if success and ticket not sent send ----add to the tree
};
