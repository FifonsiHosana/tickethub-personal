import { db } from '@/db/client.js';
import { and, eq } from 'drizzle-orm';
import { otpVerifications } from '@/db/schema/index.js';
import {
  comparePasswords,
  generateOTP,
  getOtpExpiry,
  hashPassword,
} from '../auth.utils.js';
import { now } from '@/utils/timeDatehelpers.js';
import { sendMail } from '@/modules/emails/emails.service.js';
import { AppError } from '@/middleware/errorHandler.js';
import { sendAuthOtpSms } from '../auth.sms.service.js';

const OTP_RESEND_COOLDOWN_MS = 60_000;
const OTP_RATE_WINDOW_MS = 15 * 60_000;
const OTP_RATE_LIMIT = 5;

type OtpPurpose =
  | 'EMAIL_VERIFICATION'
  | 'PASSWORD_RESET'
  | 'EMAIL_CHANGE'
  | 'LOGIN_VERIFICATION'
  | 'ORGANIZER_APPROVAL';

type RateEntry = { count: number; windowStart: number; lastSentAt: number };
const otpRateMap = new Map<string, RateEntry>();

function assertOtpSendAllowed(identifier: string, purpose: OtpPurpose) {
  const key = `${purpose}:${identifier}`;
  const nowMs = Date.now();
  const existing = otpRateMap.get(key);

  if (!existing || nowMs - existing.windowStart > OTP_RATE_WINDOW_MS) {
    otpRateMap.set(key, { count: 1, windowStart: nowMs, lastSentAt: nowMs });
    return;
  }

  if (nowMs - existing.lastSentAt < OTP_RESEND_COOLDOWN_MS) {
    throw new AppError(429, 'Please wait before requesting another code.');
  }

  if (existing.count >= OTP_RATE_LIMIT) {
    throw new AppError(429, 'Too many code requests. Please try again later.');
  }

  existing.count += 1;
  existing.lastSentAt = nowMs;
}

async function storeOtp(identifier: string, userId: number | null, purpose: OtpPurpose) {
  await db
    .delete(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, identifier),
        eq(otpVerifications.purpose, purpose),
      ),
    );

  const otp = generateOTP();
  const otpHash = await hashPassword(otp);

  await db.insert(otpVerifications).values({
    email: identifier,
    otpHash,
    purpose,
    expiresAt: getOtpExpiry(),
    userId,
    isUsed: false,
  });

  return otp;
}

/**
 * Remove stale EMAIL_VERIFICATION OTPs for an email, then generate, persist,
 * and email a fresh one. Works with or without an existing user record
 * (`userId` is nullable in `otpVerifications`).
 */
export async function sendVerificationOtp(
  email: string,
  userId: number | null,
) {
  assertOtpSendAllowed(email, 'EMAIL_VERIFICATION');
  const otp = await storeOtp(email, userId, 'EMAIL_VERIFICATION');

  await sendMail(
    email,
    'Verify your TicketHub account',
    `Your verification code is ${otp}`,
    `
      <h2>Welcome to TicketHub</h2>

      <p>Your verification code is</p>

      <h1>${otp}</h1>

      <p>This code expires in 10 minutes.</p>
    `,
  );
}

export async function sendPhoneVerificationOtp(
  phoneNumber: string,
  userId: number | null,
) {
  assertOtpSendAllowed(phoneNumber, 'EMAIL_VERIFICATION');
  const otp = await storeOtp(phoneNumber, userId, 'EMAIL_VERIFICATION');
  await sendAuthOtpSms(phoneNumber, otp);
}

export async function sendPhoneLoginOtp(phoneNumber: string, userId: number) {
  assertOtpSendAllowed(phoneNumber, 'LOGIN_VERIFICATION');
  const otp = await storeOtp(phoneNumber, userId, 'LOGIN_VERIFICATION');
  await sendAuthOtpSms(phoneNumber, otp);
}

export async function sendPhonePasswordResetOtp(
  phoneNumber: string,
  userId: number,
) {
  assertOtpSendAllowed(phoneNumber, 'PASSWORD_RESET');
  const otp = await storeOtp(phoneNumber, userId, 'PASSWORD_RESET');
  await sendAuthOtpSms(phoneNumber, otp);
}

async function verifyStoredOtp(identifier: string, otp: string, purpose: OtpPurpose) {
  const [verification] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, identifier),
        eq(otpVerifications.purpose, purpose),
        eq(otpVerifications.isUsed, false),
      ),
    )
    .limit(1);

  if (!verification) {
    throw new AppError(401, 'Invalid or expired verification code.');
  }

  const isExpired = new Date(verification.expiresAt) < new Date();

  if (isExpired) {
    throw new AppError(401, 'Verification code has expired.');
  }

  const otpMatches = await comparePasswords(otp, verification.otpHash);

  if (!otpMatches) {
    throw new AppError(401, 'Invalid verification code.');
  }

  await db
    .update(otpVerifications)
    .set({
      isUsed: true,
      updatedAt: now(),
    })
    .where(eq(otpVerifications.id, verification.id));

  return verification;
}

/**
 * Validate a fresh, unused EMAIL_VERIFICATION OTP for the email. Marks it as
 * used and returns the verification record (includes `userId` when the OTP
 * was tied to an existing account).
 */
export async function verifyEmailOtp(email: string, otp: string) {
  return verifyStoredOtp(email, otp, 'EMAIL_VERIFICATION');
}

export async function verifyPhoneOtp(phoneNumber: string, otp: string) {
  return verifyStoredOtp(phoneNumber, otp, 'EMAIL_VERIFICATION');
}

export async function verifyPhoneLoginOtp(phoneNumber: string, otp: string) {
  return verifyStoredOtp(phoneNumber, otp, 'LOGIN_VERIFICATION');
}

export async function verifyPhonePasswordResetOtp(
  phoneNumber: string,
  otp: string,
) {
  return verifyStoredOtp(phoneNumber, otp, 'PASSWORD_RESET');
}

