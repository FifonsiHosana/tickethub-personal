import { db, type Executor } from '@/db/client.js';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import {
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  ticketTypes,
  payments,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';

export async function linkOrdersByEmail(
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

  if (orderIds.length === 0) return;

  await tx
    .update(ticketOrders)
    .set({ userId })
    .where(and(inArray(ticketOrders.id, orderIds), isNull(ticketOrders.userId)));
}

export async function getOrderFromReference(
  reference: string,
  requester?: { userId?: number; email?: string; phoneNumber?: string },
) {
  const rows = await db
    .select({
      orderId: ticketOrders.id,
      status: ticketOrders.status,
      quantity: ticketOrders.quantity,
      purchasedAt: ticketOrders.createdAt,
      customerFirstName: ticketOrderUserDetails.firstName,
      customerLastName: ticketOrderUserDetails.lastName,
      customerEmail: ticketOrderUserDetails.email,
      customerPhone: ticketOrderUserDetails.phoneNumber,
      amount: payments.amount,
      currency: payments.currency,
      provider: payments.provider,
      paymentStatus: payments.status,
      orderUserId: ticketOrders.userId,
      ticketOrderItemId: ticketOrderItems.id,
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      qrCodeUrl: ticketOrderItems.qrCodeUrl,
      checkedIn: ticketOrderItems.checkedIn,
      eventTicketId: eventTickets.id,
      ticketTypeId: eventTickets.ticketTypeId,
      ticketTypeName: ticketTypes.name,
    })
    .from(ticketOrders)
    .innerJoin(
      payments,
      and(
        eq(payments.orderId, ticketOrders.id),
        eq(payments.reference, reference),
        eq(payments.status, 'Completed'),
      ),
    )
    .innerJoin(
      ticketOrderUserDetails,
      eq(ticketOrders.id, ticketOrderUserDetails.orderId),
    )
    .innerJoin(
      ticketOrderItems,
      and(
        eq(ticketOrders.id, ticketOrderItems.orderId),
        eq(ticketOrderItems.status, 'Valid'),
      ),
    )
    .leftJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .leftJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id));

  if (!rows.length) return null;

  const first = rows[0];
  const emailMatches =
    requester?.email &&
    first?.customerEmail?.toLowerCase() === requester.email.toLowerCase();
  const phoneMatches =
    requester?.phoneNumber && first?.customerPhone === requester.phoneNumber;
  const userMatches =
    requester?.userId && first?.orderUserId === requester.userId;

  if (!emailMatches && !phoneMatches && !userMatches) {
    throw new AppError(403, 'This order reference does not belong to you.');
  }

  return {
    orderId: first?.orderId,
    status: first?.status,
    quantity: first?.quantity,
    purchasedAt: first?.purchasedAt,
    customer: {
      firstName: first?.customerFirstName,
      lastName: first?.customerLastName,
      email: first?.customerEmail,
      phoneNumber: first?.customerPhone,
    },
    payment: {
      amount: first?.amount,
      currency: first?.currency,
      provider: first?.provider,
    },
    tickets: rows.map((row) => ({
      id: row.ticketOrderItemId,
      identifier: row.ticketIdentifier,
      qrCodeUrl: row.qrCodeUrl,
      checkedIn: row.checkedIn,
      eventTicketId: row.eventTicketId,
      ticketTypeId: row.ticketTypeId,
      ticketTypeName: row.ticketTypeName,
    })),
  };
}