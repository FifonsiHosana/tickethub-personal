import config from '@/config/config.js';
import crypto from 'crypto';

export const verifyPaystackSignature = (
  body: any,
  signature: string | string[] | undefined,
): boolean => {
  if (!signature) return false;

  const hash = crypto
    .createHmac('sha512', config.payment.paystack_api_key)
    .update(JSON.stringify(body))
    .digest('hex');

  return hash === signature;
};
