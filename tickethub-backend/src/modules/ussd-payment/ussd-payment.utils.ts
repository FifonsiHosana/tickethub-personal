import { db } from '@/db/client.js';
import { payments } from '@/db/schema/finance.js';
import { eq } from 'drizzle-orm';
import axios from 'axios';

export const isTransactionProcessed = async (
  reference: string,
): Promise<boolean> => {
  const [existingPayment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.reference, reference))
    .limit(1);

  return !!existingPayment;
};

// const createTicket = async () => {};

export const sendTicket = async (
  phoneNumber: string,
  ticketMessage: string,
) => {
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

export const sendTicketSmsTset = async (
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
