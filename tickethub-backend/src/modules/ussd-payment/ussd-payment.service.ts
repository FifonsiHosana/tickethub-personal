import axios from 'axios';
import crypto from 'crypto';
import type {
  PaymentWebhook,
  PaystackPaymentFields,
} from './ussd-payment.types.js';
import config from '@/config/config.js';

export const initiatePayment = async (fields: PaystackPaymentFields) => {
  try {
    const response = await axios.post(
      'https://api.paystack.co/charge',
      {
        ...fields,
      },
      {
        headers: {
          Authorization: config.payment.paystack_api_key,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const paymentComplete = async (fields: PaymentWebhook) => {
  if (fields.event !== 'charge.success') return;
  // const sourceId = fields.data.metadata.sourceId;
  const paymentRef = fields.data.reference;
  const email = fields.data.customer.email;

  const phoneNumber = fields.data.metadata.phoneNumber;
  const receiveNumber = fields.data.metadata.receiveNumber;
  const orderId = fields.data.metadata.orderId;
  const message =
    'This is your ticket enjoy from the team at tickethub! https://res.cloudinary.com/du3ndnjmd/image/upload/v1784283633/ticket_prsh5j.png';
  const giftMessage =
    "We've sent your buddy his ticket! hope they pay it forward! :)";

  console.log(fields);

  if (!paymentRef) {
    throw new Error('Missing sourceId in Paystack webhook metadata');
  }

  const alreadyProcessed = await isTransactionProcessed(paymentRef);
  if (alreadyProcessed) return;

  // Thread orderId through to processPurchase and skip confirmation email for USSD orders
  await processPurchase(orderId, email as string, false);
  console.log('payment was successful');

  //I will eventually have to await all.
  // if (receiveNumber) {
  //   sendTicket(receiveNumber, message);
  //   sendTicket(phoneNumber, giftMessage);
  //   return;
  // }
  // sendTicket(phoneNumber, message);
  sendTicketSmsTset(phoneNumber, message);
};

const checkStatus = async () => {
  //Help clients that paid and wanna know why they didn't get their tickets
  //if success and ticket not sent send ----add to the tree
};

const processPurchase = (
  paymentRef: string,
  email: string,
  sendConfirmationEmail: boolean = true,
) => {
  // TODO: Implement actual purchase processing
  // This will be called from finance.service.ts's processPurchase
  // For now, just log and return
  console.log(`Processing purchase with ref: ${paymentRef}, email: ${email}, sendConfirmationEmail: ${sendConfirmationEmail}`);
};

export const verifyPaystackSignature = (
  rawBody: Buffer | undefined,
  signature: string | string[] | undefined,
): boolean => {
  if (!signature || Array.isArray(signature)) {
    return false;
  }

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_AUTH?.split(' ')[1] as string)
    .update(rawBody as Buffer)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(signature, 'hex'),
  );
};

const isTransactionProcessed =
  // async
  (
    sourceId: string,
  ): //  Promise<boolean>
  boolean => {
    return false;
    // const existing = await db
    //   .select()
    //   .from(order)
    //   .where(eq(order.sourceId, sourceId))
    //   .limit(1);

    // if (!existing.length) return false;

    // const currentOrder = existing[0];

    // return (
    //   currentOrder?.ref !== null &&
    //   currentOrder?.status !== OrderStatus.AWAITING_PAYMENT
    // );
  };

const createTicket = async () => {};

const sendTicket = async (phoneNumber: string, ticketMessage: string) => {
  try {
    const endPoint = 'https://api.mnotify.com/api/sms/quick';
    const apiKey = 'YOUR_API_KEY';
    const url = endPoint + '?key=' + apiKey;
    // if paying for oneself
    const data = {
      recipient: [phoneNumber],
      sender: 'mNotify',
      message: ticketMessage,
      is_schedule: false,
      schedule_date: '',
    };

    axios
      .post(url, data, {
        headers: { 'Content-Type': 'application/json' },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  } catch (error) {
    console.log(error);
  }
};

const sendTicketSmsTset = async (
  to = '0206628223',
  message: string,
  sender = 'MYBRAND',
) => {
  const API = process.env.SPLITSMS_BASE_URL ?? 'https://www.splitsms.com';
  const KEY = process.env.SPLITSMS_API_KEY;
  try {
    const r = await fetch(`${API}/api/v1/sms/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        recipients: [to],
        message,
        // countryCode: "GH",
      }),
    });
    console.log(r);

    return console.log('message sent!');
  } catch (error) {
    console.log(error);
  }
};
