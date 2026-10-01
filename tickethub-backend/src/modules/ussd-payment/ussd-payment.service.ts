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
} from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';

export const initiatePayment = async (fields: PaystackPaymentFields) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/charge',
      {
        ...fields,
      },
      {
        headers: {
          Authorization: `Bearer ${config.payment.paystack_api_key}`,
        },
      },
    );

    console.log(`Paystack cHARGE ${response.data}`);

    return response.data;
  } catch (error) {
    console.log(error);
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
  const [ticketId] = await db
    .select({
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      ticketType: eventTickets.ticketTypeId,
      name: events.title,
      totalQuantity: ticketOrders.quantity,
    })
    .from(ticketOrderItems)
    .innerJoin(tickets, eq(ticketOrders.id, ticketOrderItems.orderId))
    .innerJoin(
      ticketConfigurations,
      eq(ticketOrderItems.id, ticketConfigurations.id),
    )
    .innerJoin(eventTickets, eq(tickets.eventId, eventTickets.id))
    .innerJoin(events, eq(eventTickets.id, events.id))
    .where(eq(ticketOrderItems.orderId, Number(fields.data.metadata.orderId)));
  // const sourceId = fields.data.metadata.sourceId;
  // const receiveNumber = fields.data.metadata.receiveNumber; //#for gifting if feature is required later

  const phoneNumber = fields.data.metadata.phoneNumber;
  const message = `
  ${ticketId?.name}\n
  Ticket ID: ${ticketId?.ticketIdentifier}\n
 
  `;
  const orderId = Number(fields.data.metadata.orderId);
  const paymentRef = fields.data.reference;
  const currency = fields.data.currency;
  const email = fields.data.customer.email;
  const amount = fields.data.amount / 100;
  const PROVIDER = 'paystack';

  // const giftMessage =
  //   "We've sent your buddy his ticket! hope they pay it forward! :)"; //#gifting

  if (!paymentRef) {
    throw new Error('Missing sourceId in Paystack webhook metadata');
  }

  const alreadyProcessed = await isTransactionProcessed(paymentRef);
  if (alreadyProcessed) return;

  // Thread orderId through to processPurchase and skip confirmation email for USSD orders
  await financeService.processPurchase(
    orderId,
    paymentRef,
    amount,
    currency,
    PROVIDER,
    email,
    Number(ticketId?.totalQuantity),
  );

  sendTicket(phoneNumber, message);

  //I will eventually have to await all.
  // if (receiveNumber) {
  //   sendTicket(receiveNumber, message);
  //   sendTicket(phoneNumber, giftMessage);
  //   return;
  // }
  // sendTicket(phoneNumber, message);
};

const checkStatus = async () => {
  //Help clients that paid and wanna know why they didn't get their tickets
  //if success and ticket not sent send ----add to the tree
};
