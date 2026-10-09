import { db } from '@/db/client.js';
import {
  users,
  roles,
  userRoles,
  eventStaff,
} from '@/db/schema/index.js';
import { eq, ne } from 'drizzle-orm';

import {
  hashPassword,
  comparePasswords,
  generateAccessToken,
  verifyAccessToken,
} from './auth.utils.js';
import { now } from '@/utils/timeDatehelpers.js';

import { linkOrdersByEmail } from '@/modules/attendee/attendee.service.js';
import { getUserRoleNames } from './services/auth.registration.service.js';
import {
  sendPhoneLoginOtp,
  sendVerificationOtp,
  verifyEmailOtp,
  verifyPhoneLoginOtp,
} from './services/auth.otp.service.js';
import { PasswordResetService } from './services/auth.password-reset.service.js';
import type { CreateLoginInput, CreateRegisterInput } from './auth.schema.js';
import { AppError } from '@/middleware/errorHandler.js';
import type { Roles } from './auth.types.js';
import { parseAuthIdentity } from './auth.identity.js';

export class AuthService {
  private passwordResetService = new PasswordResetService();
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

    // A verified account owns this email — block re-registration.
    if (existingUser?.isVerified) {
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

    // If inviteToken is present, verify it and allow event_staff registration
    let inviteData: { organizerId: number; eventId: number } | null = null;

    if (payload.inviteToken) {
      try {
        const decoded = verifyAccessToken(payload.inviteToken) as {
          organizerId: number;
          eventId: number;
        };
        inviteData = decoded;
      } catch {
        throw new AppError(400, 'Invalid or expired invite link.');
      }
    }

    if (!['organizer', 'attendee', 'event_staff'].includes(role.name)) {
      throw new AppError(400, 'You cannot register with this role.');
    }

    const passwordHash = await hashPassword(payload.password);

    // A pending (unverified) account exists — refresh its profile + send a new
    // OTP instead of erroring out. Role/invite stays as originally created.
    if (existingUser) {
      await db
        .update(users)
        .set({
          firstName: payload.firstName,
          lastName: payload.lastName ?? '',
          phoneNumber: payload.phoneNumber,
          passwordHash,
          updatedAt: now(),
        })
        .where(eq(users.id, existingUser.id));

      await sendVerificationOtp(payload.email, existingUser.id);

      return {
        success: true,
        alreadyPending: true,
        message:
          'An account is already pending verification. A new code has been sent to your email.',
      };
    }

    const createdUser = await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          firstName: payload.firstName,
          lastName: payload.lastName ?? '',
          email: payload.email,
          phoneNumber: payload.phoneNumber,
          passwordHash,
          isVerified: false,
          isActive: true,
        })
        .$returningId();

      await tx.insert(userRoles).values({
        userId: user?.id,
        roleId: role.id,
      });

      // If this is an event_staff registration via invite, add to EventStaff
      if (inviteData && role.name === 'event_staff') {
        await tx.insert(eventStaff).values({
          event_id: inviteData.eventId,
          staff_id: user?.id,
          assigned_by: inviteData.organizerId,
          assigned_at: now(),
        });
      }

      // Link any existing guest orders to this attendee account
      if (role.name === 'attendee' && user?.id) {
        await linkOrdersByEmail(tx, user.id, payload.email);
      }

      return user;
    });

    if (!createdUser?.id) {
      throw new AppError(500, 'Failed to create account.');
    }

    await sendVerificationOtp(payload.email, createdUser.id);

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
      throw new AppError(403, 'Please verify your email.');
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

    // get all role names of user
    const roleNames = await getUserRoleNames(user.id);

    // Link any guest orders placed with this email to the attendee account
    // (idempotent — only touches orders with no owner yet)
    if (roleNames.includes('attendee')) {
      await linkOrdersByEmail(db, user.id, user.email);
    }

    const token = generateAccessToken({
      id: user.id,
      roles: roleNames,
    });

    return {
      token,
      user,
      roles: roleNames,
    };
  }

  async requestPhoneLoginOtp(identifier: string) {
    const identity = parseAuthIdentity(identifier);
    if (identity.type !== 'phone') {
      throw new AppError(400, 'Enter a phone number to receive an SMS code.');
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, identity.value))
      .limit(1);

    if (!user || !user.isVerified || !user.isActive) {
      return { message: 'If the account exists, a login code has been sent.' };
    }

    await sendPhoneLoginOtp(identity.value, user.id);
    return { message: 'Login code sent successfully.', identifier: identity.value };
  }

  async verifyPhoneLoginOtp(identifier: string, otp: string) {
    const identity = parseAuthIdentity(identifier);
    if (identity.type !== 'phone') {
      throw new AppError(400, 'Enter a phone number to verify an SMS code.');
    }

    const verification = await verifyPhoneLoginOtp(identity.value, otp);
    if (!verification.userId) {
      throw new AppError(401, 'Invalid verification code.');
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, verification.userId))
      .limit(1);

    if (!user || !user.isVerified || !user.isActive) {
      throw new AppError(401, 'Invalid verification code.');
    }

    const roleNames = await getUserRoleNames(user.id);
    const token = generateAccessToken({ id: user.id, roles: roleNames });

    await db.update(users).set({ lastLogin: now() }).where(eq(users.id, user.id));

    return { token, user, roles: roleNames };
  }

  async verifyOtp(email: string, otp: string) {
    const verification = await verifyEmailOtp(email, otp);

    /**
     * Mark user as verified
     */
    if (verification.userId) {
      await db
        .update(users)
        .set({
          isVerified: true,
          updatedAt: now(),
        })
        .where(eq(users.id, verification.userId));
    }

    return {
      message: 'Email verified successfully.',
    };
  }

  async resendOtp(email: string) {
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
     * Generate a fresh OTP and email it
     */
    await sendVerificationOtp(email, user.id);

    return {
      message: 'Verification code sent successfully.',
    };
  }

  async forgotPassword(identifier: string) {
    return this.passwordResetService.requestPasswordReset(identifier);
  }

  async resetPassword(payload: {
    token?: string;
    identifier?: string;
    otp?: string;
    password: string;
  }) {
    if (payload.token) {
      return this.passwordResetService.resetPassword(
        payload.token,
        payload.password,
      );
    }

    if (!payload.identifier || !payload.otp) {
      throw new AppError(400, 'Reset token or verification code is required.');
    }

    return this.passwordResetService.resetPasswordWithPhoneOtp(
      payload.identifier,
      payload.otp,
      payload.password,
    );
  }
}

