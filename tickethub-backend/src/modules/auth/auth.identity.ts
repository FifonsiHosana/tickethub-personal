import { AppError } from '@/middleware/errorHandler.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Identity =
  | { type: 'email'; value: string; syntheticEmail?: never }
  | { type: 'phone'; value: string; syntheticEmail: string };

export function normalizeGhanaPhoneToE164(input: string): string {
  const raw = input.trim();
  const digits = raw.replace(/\D/g, '');

  if (raw.startsWith('+233') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith('233') && digits.length === 12) {
    return `+${digits}`;
  }

  if (digits.startsWith('223') && digits.length === 12) {
    return `+233${digits.slice(3)}`;
  }

  if (digits.startsWith('0') && digits.length === 10) {
    return `+233${digits.slice(1)}`;
  }

  if (digits.length === 9) {
    return `+233${digits}`;
  }

  throw new AppError(400, 'Enter a valid email or Ghana phone number.');
}

export function phoneToSyntheticEmail(phoneNumber: string): string {
  return `phone${phoneNumber.replace(/\D/g, '')}@tickethub.local`;
}

export function parseAuthIdentity(input: string): Identity {
  const value = input.trim();
  if (!value) {
    throw new AppError(400, 'Email or phone is required.');
  }

  if (EMAIL_RE.test(value)) {
    return { type: 'email', value: value.toLowerCase() };
  }

  const phone = normalizeGhanaPhoneToE164(value);
  return {
    type: 'phone',
    value: phone,
    syntheticEmail: phoneToSyntheticEmail(phone),
  };
}

export function publicIdentifierLabel(identifier: string) {
  const identity = parseAuthIdentity(identifier);
  return identity.value;
}
