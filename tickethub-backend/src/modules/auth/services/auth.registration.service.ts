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
import {
  sendPhoneVerificationOtp,
  sendVerificationOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
} from './auth.otp.service.js';
import { linkOrdersByEmail } from '@/modules/attendee/attendee.service.js';
import { AppError } from '@/middleware/errorHandler.js';
import type {
  CompleteRegisterInput,
  SendOtpInput,
} from '../auth.schema.js';
import { parseAuthIdentity } from '../auth.identity.js';

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
    .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, role.id)))
    .limit(1);

  if (!existingRelation) {
    await tx.insert(userRoles).values({ userId, roleId: role.id });
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
    const identity = parseAuthIdentity(payload.identifier ?? payload.email ?? '');
    const userLookup = identity.type === 'email'
      ? eq(users.email, identity.value)
      : eq(users.phoneNumber, identity.value);

    const [existingUser] = await db.select().from(users).where(userLookup).limit(1);

    if (existingUser?.passwordHash && existingUser.isVerified) {
      return {
        hasAccount: true,
        active: true,
        channel: identity.type,
        message: `An account already exists for this ${identity.type}.`,
      };
    }

    if (identity.type === 'email') {
      await sendVerificationOtp(identity.value, existingUser?.id ?? null);
    } else {
      await sendPhoneVerificationOtp(identity.value, existingUser?.id ?? null);
    }

    return {
      hasAccount: !!existingUser,
      active: false,
      channel: identity.type,
      identifier: identity.value,
      message: 'Verification code sent successfully.',
    };
  }

  async completeRegister(payload: CompleteRegisterInput) {
    const identity = parseAuthIdentity(payload.identifier ?? payload.email ?? '');

    if (identity.type === 'email') {
      await verifyEmailOtp(identity.value, payload.otp);
    } else {
      await verifyPhoneOtp(identity.value, payload.otp);
    }

    const userLookup = identity.type === 'email'
      ? eq(users.email, identity.value)
      : eq(users.phoneNumber, identity.value);

    const [existingUser] = await db.select().from(users).where(userLookup).limit(1);

    if (existingUser?.passwordHash && existingUser.isVerified) {
      throw new AppError(
        400,
        `An account with this ${identity.type} already exists. Log in instead.`,
      );
    }

    const passwordHash = await hashPassword(payload.password);
    let userId: number;
    const roleName = payload.roleName ?? 'attendee';

    if (existingUser) {
      userId = existingUser.id;
      await db
        .update(users)
        .set({
          firstName: payload.firstName ?? existingUser.firstName,
          lastName: payload.lastName ?? existingUser.lastName ?? '',
          phoneNumber: identity.type === 'phone' ? identity.value : existingUser.phoneNumber,
          passwordHash,
          isVerified: true,
          updatedAt: now(),
        })
        .where(eq(users.id, userId));
    } else {
      let firstName = payload.firstName;
      let lastName = payload.lastName;

      if (!firstName && identity.type === 'email') {
        const order = await findCompletedOrderByEmail(identity.value);
        if (!order) {
          throw new AppError(
            409,
            'We are still confirming your payment. Please try again in a minute.',
          );
        }
        firstName = order.firstName;
        lastName = order.lastName;
      }

      if (!firstName) {
        throw new AppError(400, 'First name is required.');
      }

      const [createdUser] = await db
        .insert(users)
        .values({
          firstName,
          lastName: lastName ?? '',
          email: identity.type === 'email' ? identity.value : identity.syntheticEmail,
          phoneNumber: identity.type === 'phone' ? identity.value : null,
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

    if (identity.type === 'email') {
      await linkOrdersByEmail(db, userId, identity.value);
    }

    const [freshUser] = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const rolesList = await getUserRoleNames(userId);
    const token = generateAccessToken({ id: userId, roles: rolesList });

    return { token, user: freshUser, roles: rolesList };
  }
}
