import { randomBytes } from 'crypto';
import config from '@/config/config.js';
import crypto from 'crypto';

export const verifyPaystackSignature = (
  body: unknown,
  signature: string | string[] | undefined,
): boolean => {
  if (!signature) return false;

  const payload = Buffer.isBuffer(body) ? body : JSON.stringify(body);

  const hash = crypto
    .createHmac('sha512', config.payment.paystack_api_key)
    .update(payload)
    .digest('hex');

  return hash === signature;
};

export function parsePaystackPayload(body: unknown) {
  if (Buffer.isBuffer(body)) {
    return JSON.parse(body.toString('utf8'));
  }

  return body;
}

export const makeReference = () =>
  randomBytes(9).toString('base64url').slice(0, 12);
