import { db, type Executor } from '@/db/client.js';
import { and, desc, eq } from 'drizzle-orm';
import {
  users,
  roles,
  userRoles,
  ticketOrders,
  ticketOrderUserDetails,
} from '@/db/schema/index.js';
import { hashPassword, generateAccessToken } from '../auth.utils.js';
import { now } from '@/utils/timeDatehelpers.js';
import { sendVerificationOtp, verifyEmailOtp } from './auth.otp.service.js';
import { linkOrdersByEmail } from '@/modules/attendee/attendee.service.js';
import { AppError } from '@/middleware/errorHandler.js';
import type {
  CompleteRegisterInput,
  SendOtpInput,
} from '../auth.schema.js';

export async function getUserRoleNames(userId: number): Promise<string[]> {
  const list = await db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));

  return list.map((role) => role.name);
}

export async function grantRoleIfMissing(
  tx: Executor,
  userId: number,
  roleName: string,
) {
  const [role] = await tx
    .select()
    .from(roles)
    .where(eq(roles.name, roleName))
    .limit(1);

  if (!role) {
    throw new AppError(400, 'Invalid account type.');
  }

  const [existingRelation] = await tx
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id)),
    )
    .limit(1);

  if (!existingRelation) {
    await tx.insert(userRoles).values({
      userId,
      roleId: role.id,
    });
  }

  return role;
}

async function findCompletedOrderByEmail(email: string) {
  const [order] = await db
    .select({
      orderId: ticketOrders.id,
      firstName: ticketOrderUserDetails.firstName,
      lastName: ticketOrderUserDetails.lastName,
    })
    .from(ticketOrders)
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrderUserDetails.orderId, ticketOrders.id),
    )
    .where(
      and(
        eq(ticketOrderUserDetails.email, email),
        eq(ticketOrders.status, 'Completed'),
      ),
    )
    .orderBy(desc(ticketOrders.createdAt))
    .limit(1);

  return order ?? null;
}

export class RegistrationService {
  async sendOtp(payload: SendOtpInput) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    // A fully active account owns this email — don't mint an OTP for a
    // takeover attempt; let the UI route to login instead.
    if (existingUser?.passwordHash && existingUser.isVerified) {
      return {
        hasAccount: true,
        active: true,
        message: 'An account already exists for this email.',
      };
    }

    await sendVerificationOtp(payload.email, existingUser?.id ?? null);

    return {
      hasAccount: !!existingUser,
      active: false,
      message: 'Verification code sent successfully.',
    };
  }

  async completeRegister(payload: CompleteRegisterInput) {
    await verifyEmailOtp(payload.email, payload.otp);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUser?.passwordHash && existingUser.isVerified) {
      throw new AppError(
        400,
        'An account with this email already exists. Log in instead.',
      );
    }

    const passwordHash = await hashPassword(payload.password);

    let userId: number;
    let roleName = payload.roleName ?? 'attendee';

    if (existingUser) {
      /**
       * Purchase-created (null password) or pending-unverified account —
       * activate it. Names come from checkout; override when provided.
       */
      userId = existingUser.id;

      await db
        .update(users)
        .set({
          firstName: payload.firstName ?? existingUser.firstName,
          lastName: payload.lastName ?? existingUser.lastName,
          passwordHash,
          isVerified: true,
          updatedAt: now(),
        })
        .where(eq(users.id, userId));
    } else {
      /**
       * No account yet. Organizer signup provides names; otherwise fall back
       * to the buyer details from their latest completed order (covers any
       * webhook delay after purchase).
       */
      let firstName = payload.firstName;
      let lastName = payload.lastName;

      if (!firstName || !lastName) {
        const order = await findCompletedOrderByEmail(payload.email);

        if (!order) {
          throw new AppError(
            409,
            'We are still confirming your payment. Please try again in a minute.',
          );
        }

        firstName = order.firstName;
        lastName = order.lastName;
      }

      const [createdUser] = await db
        .insert(users)
        .values({
          firstName,
          lastName,
          email: payload.email,
          passwordHash,
          isVerified: true,
          isActive: true,
        })
        .$returningId();

      if (!createdUser?.id) {
        throw new AppError(500, 'Failed to create account.');
      }

      userId = createdUser.id;
    }

    await grantRoleIfMissing(db, userId, roleName);

    // Link any guest orders placed with this email (idempotent)
    await linkOrdersByEmail(db, userId, payload.email);

    const [freshUser] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const rolesList = await getUserRoleNames(userId);

    const token = generateAccessToken({
      id: userId,
      roles: rolesList,
    });

    return {
      token,
      user: freshUser,
      roles: rolesList,
    };
  }
}