import axios from 'axios';
import config from '@/config/config.js';
import { db } from '@/db/client.js';
import { smsHistory, creditWallet } from '@/db/schema/index.js';
import { eq, sql } from 'drizzle-orm';
import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';
import { AppError } from '@/middleware/errorHandler.js';

const MNOTIFY_BASE_URL = 'https://api.mnotify.com/api';

function formatMNotifyScheduleDate(dateString: string): string {
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError(400, 'Invalid scheduleDate format');
  }

  const pad = (value: number) => String(value).padStart(2, '0');
  const year = parsed.getFullYear();
  const month = pad(parsed.getMonth() + 1);
  const day = pad(parsed.getDate());
  const hours = pad(parsed.getHours());
  const minutes = pad(parsed.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export interface SendSmsParams {
  userId: number;
  message: string;
  recipients: string[];
  sender?: string | undefined;
  scheduled?: boolean | undefined;
  scheduleDate?: string | null | undefined;
  meta?: {
    selectedEventId?: number | string | null | undefined;
    audienceMode?: string | undefined;
    selectedGroupIds?: (string | number)[] | undefined;
    audienceLabel?: string | undefined;
  } | undefined;
}

export interface SmsSendResult {
  success: boolean;
  data: any;
  credit: {
    creditUsed: string;
    creditLeft: string;
    smsCount: number;
  };
}

export class SmsService {
  async getBalance(userId: number) {
    const [wallet] = await db
      .select()
      .from(creditWallet)
      .where(eq(creditWallet.userId, userId));

    return wallet;
  }

  async getHistory(userId: number) {
    const history = await db
      .select()
      .from(smsHistory)
      .where(eq(smsHistory.userId, userId))
      .orderBy(smsHistory.createdAt);

    return history;
  }

  async sendSms(params: SendSmsParams): Promise<SmsSendResult> {
    const { userId, message, recipients, sender, scheduled = false, scheduleDate, meta } = params;
    const apiKey = config.sms.mnotify_api_key;
    const senderId = sender || config.sms.sender_id || 'TicketHub';
    const eventId = meta?.selectedEventId !== undefined && meta?.selectedEventId !== null
      ? Number(meta.selectedEventId)
      : undefined;

    if (!apiKey) {
      throw new AppError(500, 'MNotify API key is not configured');
    }

    const [wallet] = await db
      .select()
      .from(creditWallet)
      .where(eq(creditWallet.userId, userId));

    if (!wallet) {
      throw new AppError(400, 'No credit wallet found. Please contact support.');
    }

    const currentBalance = parseFloat(wallet.creditLeft);
    if (currentBalance <= 0) {
      throw new AppError(400, 'Insufficient credit balance. Please add credit to your wallet.');
    }

    const smsCount = recipients.length;
    const cost = smsCount;

    if (currentBalance < cost) {
      throw new AppError(400, `Insufficient credit. You need ${cost} credits but only have ${currentBalance}.`);
    }

    const payload = {
      recipient: recipients,
      sender: senderId,
      message,
      is_schedule: scheduled,
      schedule_date: scheduled ? formatMNotifyScheduleDate(scheduleDate as string) : '',
    };

    const response = await axios.post(
      `${MNOTIFY_BASE_URL}/sms/quick?key=${encodeURIComponent(apiKey)}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const status = response.data?.status ? 'sent' : 'failed';
    const sentAt = response.data?.status ? formatDateForMySQL(new Date()) : null;

    await db.insert(smsHistory).values({
      userId,
      message,
      recipients: JSON.stringify(recipients),
      sender: senderId,
      status,
      scheduledAt: scheduled ? scheduleDate : null,
      sentAt,
      eventId,
    });

    await db
      .update(creditWallet)
      .set({
        creditLeft: sql`${creditWallet.creditLeft} - ${cost}`,
        creditUsed: sql`${creditWallet.creditUsed} + ${cost}`,
        updatedAt: formatDateForMySQL(new Date()),
      })
      .where(eq(creditWallet.userId, userId));

    return {
      success: true,
      data: response.data,
      credit: {
        creditUsed: (parseFloat(wallet.creditUsed) + cost).toFixed(2),
        creditLeft: (parseFloat(wallet.creditLeft) - cost).toFixed(2),
        smsCount,
      },
    };
  }
}

export const smsService = new SmsService();