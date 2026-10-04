import axios from 'axios';
import config from '@/config/config.js';
import logger from '@/utils/logger/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { normalizeGhanaPhoneToE164 } from './auth.identity.js';

const MNOTIFY_URL = 'https://api.mnotify.com/api/sms/quick';

export async function sendAuthOtpSms(phoneNumber: string, otp: string) {
  const recipient = normalizeGhanaPhoneToE164(phoneNumber).replace(/^\+/, '');
  const apiKey = config.sms.mnotify_api_key;

  if (!apiKey) {
    throw new AppError(500, 'SMS provider is not configured.');
  }

  try {
    const response = await axios.post(
      MNOTIFY_URL,
      {
        recipient: [recipient],
        sender: config.sms.sender_id || 'TicketHub',
        message: `Your TicketHub verification code is ${otp}. It expires in 10 minutes.`,
        is_schedule: false,
        schedule_date: '',
      },
      {
        params: { key: apiKey },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10_000,
      },
    );

    if (response.data?.status !== 'success') {
      logger.error({ phoneNumber: recipient, response: response.data }, 'mNotify rejected auth OTP SMS');
      throw new AppError(502, 'Unable to send SMS code. Please try again.');
    }
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ phoneNumber: recipient, error }, 'Failed to send auth OTP SMS');
    throw new AppError(502, 'Unable to send SMS code. Please try again.');
  }
}
