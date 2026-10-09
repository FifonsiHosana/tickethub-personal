import { type Executor } from '@/db/client.js';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import {
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  eventTickets,
  ticketTypes,
  payments,
} from '@/db/schema/index.js';
import { db } from '@/db/client.js';

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

export async function getOrderFromReference(reference: string) {
  console.log('REFERENCE RECEIVED:', reference);
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
      and(eq(payments.orderId, ticketOrders.id), eq(payments.reference, reference)),
    )
    .innerJoin(ticketOrderUserDetails, eq(ticketOrders.id, ticketOrderUserDetails.orderId))
    .innerJoin(ticketOrderItems, eq(ticketOrders.id, ticketOrderItems.orderId))
    .leftJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .leftJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id));

  if (!rows.length) return null;
  const first = rows[0];

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
