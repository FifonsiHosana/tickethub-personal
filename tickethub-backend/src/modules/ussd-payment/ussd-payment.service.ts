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
import { ticketOrderItems } from '@/db/schema/index.js';
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

    // logger.info()
    console.log(`Paystack cHARGE ${response.data.status}`);

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const paymentComplete = async (fields: PaymentWebhook) => {
  const financeService = new FinanceService();
  if (fields.event !== 'charge.success') return;
  const [ticketId] = await db
    .select({ ticketIdentifier: ticketOrderItems.ticketIdentifier })
    .from(ticketOrderItems)
    .where(eq(ticketOrderItems.orderId, Number(fields.data.metadata.orderId)));
  // const sourceId = fields.data.metadata.sourceId;
  // const receiveNumber = fields.data.metadata.receiveNumber; //#for gifting if feature is required later

  const phoneNumber = fields.data.metadata.phoneNumber;
  const message = `Your ticket purhase was sucessful This is your ticket code ${ticketId} enjoy from the team at tickethub!`;
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
