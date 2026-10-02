import { db } from '@/db/client.js';
import { payments } from '@/db/schema/finance.js';
import { eq } from 'drizzle-orm';
import axios from 'axios';
import config from '@/config/config.js';
import logger from '@/utils/logger/index.js';
import type { TelcoProviders } from '../ussd/ussd.types.js';

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

const PROVIDER_MAP: Record<string, TelcoProviders> = {
  mtn: 'mtn',
  vod: 'vod',
  vodafone: 'vod',
  telecel: 'vod',
  atl: 'atl',
  airteltigo: 'atl',
  airtel: 'atl',
  tigo: 'atl',
};

export const toPaystackProvider = (value: string): TelcoProviders => {
  const provider = PROVIDER_MAP[value.trim().toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported mobile money provider: ${value}`);
  }
  return provider;
};

export const sendTicket = async (
  phoneNumber: string,
  ticketMessage: string,
): Promise<boolean> => {
  try {
    const response = await axios.post(
      'https://api.mnotify.com/api/sms/quick',
      {
        recipient: [phoneNumber],
        sender: config.sms.sender_id,
        message: ticketMessage,
        is_schedule: false,
        schedule_date: '',
      },
      {
        params: { key: config.sms.mnotify_api_key },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      },
    );

    if (response.data?.status !== 'success') {
      logger.error(
        { phoneNumber, response: response.data },
        'mNotify rejected SMS',
      );
      return false;
    }

    logger.info({ phoneNumber }, 'Ticket SMS sent');
    return true;
  } catch (err) {
    // log only safe fields, never the full axios error (it contains the API key in the URL)
    if (axios.isAxiosError(err)) {
      logger.error(
        {
          phoneNumber,
          status: err.response?.status,
          data: err.response?.data,
          message: err.message,
        },
        'Failed to send ticket SMS',
      );
    } else {
      logger.error({ phoneNumber, err }, 'Failed to send ticket SMS');
    }
    return false;
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
