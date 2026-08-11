import { and, eq, isNull, inArray } from 'drizzle-orm';
import {
  users,
  roles,
  userRoles,
  ticketOrders,
  ticketOrderUserDetails,
} from '@/db/schema/index.js';
import type { Executor } from '@/db/client.js';

/**
 * Ensure a user account exists for a completed guest order.
 *
 * When a guest completes a purchase, an account is created for them (null
 * password, unverified) and the order is linked to it. If a user already
 * matches the email, orders are simply linked to them — a user can already be
 * an organizer/attendee, so no duplicate account is ever created.
 */
export interface EnsureAccountResult {
  accountCreated: boolean;
}

export async function ensureAccountForOrder(
  tx: Executor,
  orderId: number,
  email: string,
): Promise<EnsureAccountResult> {
  const [order] = await tx
    .select({ id: ticketOrders.id, userId: ticketOrders.userId })
    .from(ticketOrders)
    .where(eq(ticketOrders.id, orderId))
    .limit(1);

  if (!order || order.userId !== null) {
    return { accountCreated: false };
  }

  const [existingUser] = await tx
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser) {
    await grantAttendeeRole(tx, existingUser.id);
    await linkOrdersForEmail(tx, existingUser.id, email);
    return { accountCreated: false };
  }

  const [details] = await tx
    .select({
      firstName: ticketOrderUserDetails.firstName,
      lastName: ticketOrderUserDetails.lastName,
    })
    .from(ticketOrderUserDetails)
    .where(eq(ticketOrderUserDetails.orderId, orderId))
    .limit(1);

  if (!details) {
    return { accountCreated: false };
  }

  const [attendeeRole] = await tx
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, 'attendee'))
    .limit(1);

  const [createdUser] = await tx
    .insert(users)
    .values({
      firstName: details.firstName,
      lastName: details.lastName,
      email,
      isVerified: false,
      isActive: true,
    })
    .$returningId();

  if (!createdUser?.id) {
    return { accountCreated: false };
  }

  if (attendeeRole?.id) {
    await tx.insert(userRoles).values({
      userId: createdUser.id,
      roleId: attendeeRole.id,
    });
  }

  await linkOrdersForEmail(tx, createdUser.id, email);

  return { accountCreated: true };
}

async function grantAttendeeRole(tx: Executor, userId: number) {
  const [attendeeRole] = await tx
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, 'attendee'))
    .limit(1);

  if (!attendeeRole?.id) {
    return;
  }

  const [existingRelation] = await tx
    .select({ id: userRoles.id })
    .from(userRoles)
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.roleId, attendeeRole.id)),
    )
    .limit(1);

  if (!existingRelation) {
    await tx.insert(userRoles).values({
      userId,
      roleId: attendeeRole.id,
    });
  }
}

async function linkOrdersForEmail(
  tx: Executor,
  userId: number,
  email: string,
) {
  const orders = await tx
    .select({ orderId: ticketOrderUserDetails.orderId })
    .from(ticketOrderUserDetails)
    .where(eq(ticketOrderUserDetails.email, email));

  const orderIds = orders
    .map((order) => order.orderId)
    .filter((id): id is number => id !== null);

  if (orderIds.length === 0) {
    return;
  }

  await tx
    .update(ticketOrders)
    .set({ userId })
    .where(
      and(inArray(ticketOrders.id, orderIds), isNull(ticketOrders.userId)),
    );
}