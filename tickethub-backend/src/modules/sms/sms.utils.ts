import { AppError } from '@/middleware/errorHandler.js';

export function formatMNotifyScheduleDate(dateString: string): string {
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

export const MNOTIFY_BASE_URL = 'https://api.mnotify.com/api';