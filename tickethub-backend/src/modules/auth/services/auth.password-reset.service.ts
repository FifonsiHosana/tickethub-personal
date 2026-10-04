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
import { parseAuthIdentity } from '../auth.identity.js';
import {
  sendPhonePasswordResetOtp,
  verifyPhonePasswordResetOtp,
} from './auth.otp.service.js';

const RESET_LINK_TTL_MINUTES = 60;

const GENERIC_MESSAGE =
  'If an account exists for that email or phone, password reset instructions have been sent.';

export class PasswordResetService {
  async requestPasswordReset(identifier: string) {
    const identity = parseAuthIdentity(identifier);

    if (identity.type === 'phone') {
      return this.requestPhonePasswordReset(identity.value);
    }

    return this.requestEmailPasswordReset(identity.value);
  }

  private async requestEmailPasswordReset(email: string) {
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

    return { message: GENERIC_MESSAGE, channel: 'email' as const };
  }

  private async requestPhonePasswordReset(phoneNumber: string) {
    const [user] = await db
      .select({
        id: users.id,
        isVerified: users.isVerified,
        isActive: users.isActive,
      })
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))
      .limit(1);

    if (user?.isVerified && user.isActive) {
      await sendPhonePasswordResetOtp(phoneNumber, user.id);
    }

    return { message: GENERIC_MESSAGE, channel: 'phone' as const };
  }

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

    return this.updatePasswordFromVerification(match, password, {
      expiredMessage: 'This reset link has expired.',
      invalidMessage: 'Invalid or expired reset link.',
    });
  }

  async resetPasswordWithPhoneOtp(
    identifier: string,
    otp: string,
    password: string,
  ) {
    const identity = parseAuthIdentity(identifier);
    if (identity.type !== 'phone') {
      throw new AppError(400, 'Enter a phone number to verify an SMS code.');
    }

    const verification = await verifyPhonePasswordResetOtp(identity.value, otp);

    return this.updatePasswordFromVerification(verification, password, {
      expiredMessage: 'Verification code has expired.',
      invalidMessage: 'Invalid verification code.',
      alreadyMarkedUsed: true,
    });
  }

  private async updatePasswordFromVerification(
    verification: typeof otpVerifications.$inferSelect,
    password: string,
    options: {
      expiredMessage: string;
      invalidMessage: string;
      alreadyMarkedUsed?: boolean;
    },
  ) {
    if (verification.userId == null) {
      throw new AppError(400, options.invalidMessage);
    }

    const userId = verification.userId;
    const isExpired = new Date(verification.expiresAt) < new Date();

    if (isExpired) {
      throw new AppError(400, options.expiredMessage);
    }

    const passwordHash = await hashPassword(password);

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ passwordHash, updatedAt: now() })
        .where(eq(users.id, userId));

      if (!options.alreadyMarkedUsed) {
        await tx
          .update(otpVerifications)
          .set({ isUsed: true, updatedAt: now() })
          .where(eq(otpVerifications.id, verification.id));
      }
    });

    return { message: 'Password updated successfully. Please sign in.' };
  }
}

