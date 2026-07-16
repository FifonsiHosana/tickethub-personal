import { db } from '@/db/client.js';
import {
  users,
  roles,
  userRoles,
  otpVerifications,
} from '@/db/schema/index.js';
import { eq, and, ne } from 'drizzle-orm';

import {
  hashPassword,
  comparePasswords,
  generateOTP,
  generateAccessToken,
  getOtpExpiry,
} from './auth.utils.js';

import { sendMail } from '@/modules/emails/emails.service.js';
import type { CreateLoginInput, CreateRegisterInput } from './auth.schema.js';
import { AppError } from '@/middleware/errorHandler.js';
import type { Roles } from './auth.types.js';

export class AuthService {
  async getUserRoles(): Promise<Roles[]> {
    const rolesResponse = await db.select().from(roles).where(ne(roles.id, 1));
    return rolesResponse;
  }

  async register(payload: CreateRegisterInput) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUser) {
      throw new AppError(400, 'An account with this email already exists.');
    }

    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.id, payload.roleId))
      .limit(1);

    if (!role) {
      throw new AppError(400, 'Invalid role selected.');
    }

    if (!['organizer', 'attendee'].includes(role.name)) {
      throw new AppError(400, 'You cannot register with this role.');
    }

    const passwordHash = await hashPassword(payload.password);

    const [createdUser] = await db
      .insert(users)
      .values({
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
        passwordHash,
        isVerified: false,
        isActive: true,
      })
      .$returningId();

    await db.insert(userRoles).values({
      userId: createdUser?.id,
      roleId: role.id,
    });

    await db
      .delete(otpVerifications)
      .where(
        and(
          eq(otpVerifications.email, payload.email),
          eq(otpVerifications.purpose, 'EMAIL_VERIFICATION'),
        ),
      );

    const otp = generateOTP();

    const otpHash = await hashPassword(otp);

    await db.insert(otpVerifications).values({
      email: payload.email,
      otpHash,
      purpose: 'EMAIL_VERIFICATION',
      expiresAt: getOtpExpiry(),
      userId: createdUser?.id,
    });

    await sendMail(
      payload.email,
      'Verify your TicketHub account',
      `Your verification code is ${otp}`,
      `
            <h2>Welcome to TicketHub</h2>

            <p>Your verification code is</p>

            <h1>${otp}</h1>

            <p>This code expires in 10 minutes.</p>
        `,
    );

    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
    };
  }

  async login(payload: CreateLoginInput) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (!user) {
      throw new AppError(400, 'Invalid credentials.');
    }

    if (!user.passwordHash) {
      throw new AppError(400, 'User has no password.');
    }

    if (!user.isVerified) {
      throw new AppError(401, 'Please verify your email.');
    }

    if (!user.isActive) {
      throw new AppError(401, 'This account has been disabled.');
    }

    const passwordMatches = await comparePasswords(
      payload.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new AppError(401, 'Invalid credentials.');
    }

    // get specific role name of user
    const [userRole] = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id))


    const token = generateAccessToken({
      sub: user.id,
      role: userRole?.Roles.name,
    });

    return {
      token,
      user,
    };
  }

  async verifyOtp(email: string, otp: string) {
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

    /**
     * Mark user as verified
     */
    if (verification.userId) {
      await db
        .update(users)
        .set({
          isVerified: true,
          updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
        })
        .where(eq(users.id, verification.userId));
    }

    /**
     * Mark OTP as used
     */
    await db
      .update(otpVerifications)
      .set({
        isUsed: true,
        updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      })
      .where(eq(otpVerifications.id, verification.id));

    return {
      message: 'Email verified successfully.',
    };
  }

  async resendOtp(email: string) {
    // const user = await db.query.users.findFirst({
    //   where: eq(users.email, email),
    // });
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      /**
       * Do not reveal if email exists.
       * This prevents email enumeration attacks.
       */
      return {
        message: 'If the account exists, a verification code has been sent.',
      };
    }

    if (user.isVerified) {
      throw new AppError(400, 'Account is already verified.');
    }

    /**
     * Remove old verification OTPs
     */
    await db
      .delete(otpVerifications)
      .where(
        and(
          eq(otpVerifications.email, email),
          eq(otpVerifications.purpose, 'EMAIL_VERIFICATION'),
        ),
      );

    /**
     * Generate new OTP
     */
    const otp = generateOTP();

    /**
     * Hash OTP before storing
     */
    const otpHash = await hashPassword(otp);

    /**
     * Save new OTP
     */
    await db.insert(otpVerifications).values({
      userId: user.id,
      email,
      otpHash,
      purpose: 'EMAIL_VERIFICATION',
      expiresAt: getOtpExpiry(),
      isUsed: false,
    });

    /**
     * Send email
     */
    await sendMail(
      email,
      'Your TicketHub verification code',
      `Your verification code is ${otp}`,
      `
      <div>
        <h2>TicketHub Email Verification</h2>

        <p>Your new verification code is:</p>

        <h1>${otp}</h1>

        <p>
          This code expires in 10 minutes.
        </p>
      </div>
    `,
    );

    return {
      message: 'Verification code sent successfully.',
    };
  }

  async forgotPassword(email: string) {
    /**
     * Generate reset token
     * Store token
     * Email user
     */

    return {
      message: 'If the email exists, a password reset email has been sent.',
    };
  }

  async resetPassword(token: string, password: string) {
    /**
     * Validate token
     * Hash password
     * Update user
     * Delete token
     */

    return {
      message: 'Password updated successfully.',
    };
  }
}
