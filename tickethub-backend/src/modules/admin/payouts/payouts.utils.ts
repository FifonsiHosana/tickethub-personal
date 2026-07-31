import axios from 'axios';
import { db } from '@/db/client.js';
import { platformSettings } from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';
import config from '@/config/config.js';
import { AppError } from '@/middleware/errorHandler.js';

export async function getSetting(key: string): Promise<string | null> {
  const [row] = await db
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function callPaystackTransfer(recipientCode: string, amountInPesewas: number, reason: string) {
  const response = await axios.post(
    'https://api.paystack.co/transfer',
    { source: 'balance', amount: amountInPesewas, recipient: recipientCode, reason },
    {
      headers: {
        Authorization: `Bearer ${config.payment.paystack_api_key}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
}

export async function createPaystackRecipient(payload: Record<string, string>) {
  const response = await axios.post(
    'https://api.paystack.co/transferrecipient',
    payload,
    {
      headers: {
        Authorization: `Bearer ${config.payment.paystack_api_key}`,
        'Content-Type': 'application/json',
      },
    },
  );
  const recipientCode = response.data?.data?.recipient_code as string | undefined;
  if (!recipientCode) throw new AppError(502, 'Failed to create Paystack recipient');
  return recipientCode;
}
