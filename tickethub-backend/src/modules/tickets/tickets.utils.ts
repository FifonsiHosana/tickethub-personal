import { randomUUID } from 'crypto';
import QRCode from 'qrcode';
import config from '@/config/config.js';

export function generateTicketIdentifier(eventName: string) {
  const eventTitleShortener = eventName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return `${eventTitleShortener}-${randomUUID().substring(0, 6)}`;
}

export async function generateQrCodeDataUrl(
  ticketIdentifier: string,
): Promise<string> {
  const url = `${config.appUrl}/t/${ticketIdentifier}`;
  return await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 1,
  });
}

export async function generateQrCodeBuffer(
  ticketIdentifier: string,
): Promise<{ buffer: Buffer; cid: string }> {
  const url = `${config.appUrl}/t/${ticketIdentifier}`;
  const buffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 300,
    margin: 1,
  });
  return { buffer, cid: `qr-${ticketIdentifier}` };
}
