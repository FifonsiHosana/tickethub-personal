import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client.js';
import { otpVerifications, users } from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { sendMail } from '@/modules/emails/emails.service.js';
import { buildPasswordResetEmail } from '@/modules/emails/templates/passwordReset.template.js';
import config from '@/config/config.js';
import { now } from '@/utils/timeDatehelpers.js';
import {
  comparePasswords,
  generateRandomToken,
  getOtpExpiry,
  hashPassword,
} from '../auth.utils.js';

const RESET_LINK_TTL_MINUTES = 60;

const GENERIC_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

export class PasswordResetService {
  /**
   * Issue a one-time reset link for the email. The response is identical
   * whether the account exists or not (anti-enumeration, mirrors resendOtp).
   */
  async requestPasswordReset(email: string) {
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user) {
      await db
        .delete(otpVerifications)
        .where(
          and(
            eq(otpVerifications.email, email),
            eq(otpVerifications.purpose, 'PASSWORD_RESET'),
          ),
        );

      const token = generateRandomToken();
      const tokenHash = await hashPassword(token);

      await db.insert(otpVerifications).values({
        email,
        otpHash: tokenHash,
        purpose: 'PASSWORD_RESET',
        expiresAt: getOtpExpiry(RESET_LINK_TTL_MINUTES),
        userId: user.id,
        isUsed: false,
      });

      const resetLink = `${config.appUrl}/reset-password?token=${token}`;
      const { subject, text, html } = buildPasswordResetEmail(resetLink);

      await sendMail(email, subject, text, html);
    }

    return { message: GENERIC_MESSAGE };
  }

  /**
   * Redeem a reset token: hash the submitted token against stored hashes,
   * then set the user's password and mark the link as used.
   */
  async resetPassword(token: string, password: string) {
    const candidates = await db
      .select()
      .from(otpVerifications)
      .where(
        and(
          eq(otpVerifications.purpose, 'PASSWORD_RESET'),
          eq(otpVerifications.isUsed, false),
        ),
      );

    let match: (typeof candidates)[number] | undefined;

    for (const candidate of candidates) {
      if (await comparePasswords(token, candidate.otpHash)) {
        match = candidate;
        break;
      }
    }

    if (!match) {
      throw new AppError(400, 'Invalid or expired reset link.');
    }

    if (match.userId == null) {
      throw new AppError(400, 'Invalid or expired reset link.');
    }

    const userId = match.userId;
    const isExpired = new Date(match.expiresAt) < new Date();

    if (isExpired) {
      throw new AppError(400, 'This reset link has expired.');
    }

    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now() })
        .where(eq(users.id, userId));

      await tx
        .update(otpVerifications)
        .set({ isUsed: true, updatedAt: now() })
        .where(eq(otpVerifications.id, match.id));
    });

    return { message: 'Password updated successfully. Please sign in.' };
  }
}