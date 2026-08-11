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

/**
 * Remove stale EMAIL_VERIFICATION OTPs for an email, then generate, persist,
 * and email a fresh one. Works with or without an existing user record
 * (`userId` is nullable in `otpVerifications`).
 */
export async function sendVerificationOtp(
  email: string,
  userId: number | null,
) {
  await db
    .delete(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.purpose, 'EMAIL_VERIFICATION'),
      ),
    );

  const otp = generateOTP();

  const otpHash = await hashPassword(otp);

  await db.insert(otpVerifications).values({
    email,
    otpHash,
    purpose: 'EMAIL_VERIFICATION',
    expiresAt: getOtpExpiry(),
    userId,
    isUsed: false,
  });

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

/**
 * Validate a fresh, unused EMAIL_VERIFICATION OTP for the email. Marks it as
 * used and returns the verification record (includes `userId` when the OTP
 * was tied to an existing account).
 */
export async function verifyEmailOtp(email: string, otp: string) {
  const [verification] = await db
    .select()
    .from(otpVerifications)
    .where(
      and(
        eq(otpVerifications.email, email),
        eq(otpVerifications.purpose, 'EMAIL_VERIFICATION'),
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
