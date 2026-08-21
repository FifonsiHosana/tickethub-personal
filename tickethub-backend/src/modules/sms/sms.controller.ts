import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import config from '@/config/config.js';
import { AppError } from '@/middleware/errorHandler.js';
import type { SendSmsInput } from './sms.schema.js';
import { db } from '@/db/client.js';
import { smsHistory, creditWallet } from '@/db/schema/index.js';
import { eq, sql } from 'drizzle-orm';
import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';

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

export class SmsController {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const [wallet] = await db
        .select()
        .from(creditWallet)
        .where(eq(creditWallet.userId, userId));

      if (!wallet) {
        return res.status(200).json({
          success: true,
          data: {
            totalCredit: '0.00',
            creditUsed: '0.00',
            creditLeft: '0.00',
            isActive: true,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          totalCredit: wallet.totalCredit,
          creditUsed: wallet.creditUsed,
          creditLeft: wallet.creditLeft,
          isActive: wallet.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const history = await db
        .select()
        .from(smsHistory)
        .where(eq(smsHistory.userId, userId))
        .orderBy(smsHistory.createdAt);

      return res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async sendSms(
    req: Request<{}, {}, SendSmsInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const { message, recipients, sender, scheduled = false, scheduleDate, meta } = req.body;
      const apiKey = config.sms.mnotify_api_key;
      const senderId = sender || config.sms.sender_id || 'TicketHub';
      const eventId = meta?.selectedEventId !== undefined && meta?.selectedEventId !== null
        ? Number(meta.selectedEventId)
        : undefined;

      if (!apiKey) {
        throw new AppError(500, 'MNotify API key is not configured');
      }

      // Check credit balance
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

      // Calculate cost (assuming 1 credit per SMS)
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

      // Save to database
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

      // Update credit wallet
      await db
      .update(creditWallet)
      .set({
        // This forces the database to do the math safely at execution time
        creditLeft: sql`${creditWallet.creditLeft} - ${cost}`,
        creditUsed: sql`${creditWallet.creditUsed} + ${cost}`,
        updatedAt: formatDateForMySQL(new Date()),
      })
      .where(eq(creditWallet.userId, userId));

      return res.status(200).json({
        success: true,
        data: response.data,
        credit: {
          creditUsed: (parseFloat(wallet.creditUsed) + cost).toFixed(2),
          creditLeft: (parseFloat(wallet.creditLeft) - cost).toFixed(2),
          smsCount,
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return res.status(error.response.status || 502).json({
          success: false,
          message: error.response.data?.message || 'MNotify API error',
          details: error.response.data,
        });
      }

      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      next(error);
    }
  }
}

export default new SmsController();
