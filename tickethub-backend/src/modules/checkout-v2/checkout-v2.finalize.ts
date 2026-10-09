import { and, eq, sql, asc } from 'drizzle-orm';
import { db } from '@/db/client.js';
import {
  payments,
  ticketConfigurations,
  ticketOrderIntents,
  ticketOrderItems,
  ticketOrders,
  ticketOrderUserDetails,
  eventTickets,
  tickets,
  ticketTypes,
  events,
  eventsVenues,
} from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { ensureAccountForOrder } from '@/modules/attendee/guest-account.service.js';
import { generateTicketIdentifier } from '@/modules/tickets/tickets.utils.js';
import config from '@/config/config.js';
import { now } from '@/utils/timeDatehelpers.js';
import { calculateTotals, toPesewas, type CheckoutLine } from './checkout-v2.types.js';

function affectedRows(result: unknown) {
  const value = Array.isArray(result) ? result[0] : result;
  return Number((value as { affectedRows?: number })?.affectedRows ?? 0);
}

async function loadIssuedTickets(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], orderId: number) {
  return tx
    .select({
      ticketIdentifier: ticketOrderItems.ticketIdentifier,
      ticketType: ticketTypes.name,
      ticketName: ticketTypes.name,
      price: ticketConfigurations.price,
      eventName: events.title,
      eventDate: events.dateAndTime,
      venueName: eventsVenues.venue_name,
      qrCodeUrl: ticketOrderItems.qrCodeUrl,
    })
    .from(ticketOrderItems)
    .innerJoin(eventTickets, eq(ticketOrderItems.eventTicketId, eventTickets.id))
    .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
    .innerJoin(events, eq(tickets.eventId, events.id))
    .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
    .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
    .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
    .where(eq(ticketOrderItems.orderId, orderId))
    .orderBy(asc(ticketOrderItems.id));
}

export async function finalizeCheckoutV2(payload: any) {
  const metadata = payload.data?.metadata ?? {};
  const orderId = Number(metadata.orderId);
  const reference = String(payload.data?.reference ?? '');
  const amountPaid = Number(payload.data?.amount ?? 0);
  const currency = String(payload.data?.currency ?? 'GHS');
  const email = String(payload.data?.customer?.email ?? '');

  if (!orderId || !reference) throw new Error('Invalid v2 checkout metadata');

  return db.transaction(async (tx) => {
    const [existing] = await tx.select({ id: payments.id }).from(payments).where(eq(payments.reference, reference));
    if (existing) return { orderId, alreadyProcessed: true, tickets: [] };

    const [order] = await tx.select().from(ticketOrders).where(eq(ticketOrders.id, orderId));
    if (!order || order.status === 'Completed') return { orderId, alreadyProcessed: true, tickets: [] };

    const intents = await tx
      .select({
        eventTicketId: ticketOrderIntents.eventTicketId,
        quantity: ticketOrderIntents.quantity,
        unitPrice: ticketOrderIntents.unitPrice,
        configId: ticketConfigurations.id,
        eventName: events.title,
        ticketName: ticketTypes.name,
      })
      .from(ticketOrderIntents)
      .innerJoin(eventTickets, eq(ticketOrderIntents.eventTicketId, eventTickets.id))
      .innerJoin(tickets, eq(eventTickets.ticketId, tickets.id))
      .innerJoin(events, eq(tickets.eventId, events.id))
      .innerJoin(ticketTypes, eq(eventTickets.ticketTypeId, ticketTypes.id))
      .innerJoin(ticketConfigurations, eq(eventTickets.ticketConfigurationId, ticketConfigurations.id))
      .where(eq(ticketOrderIntents.orderId, orderId));

    if (intents.length === 0) throw new AppError(409, 'Order has no checkout items.');

    const lines: CheckoutLine[] = intents.map((item) => ({
      eventTicketId: item.eventTicketId as number,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      eventName: item.eventName,
      ticketName: item.ticketName,
      configId: item.configId,
    }));
    const totals = calculateTotals(lines);
    if (amountPaid !== toPesewas(totals.totalAmount)) {
      throw new AppError(400, 'Paid amount does not match order total.');
    }

    for (const line of lines) {
      const update = await tx.execute(sql`
        UPDATE TicketConfigurations
        SET totalSold = totalSold + ${line.quantity},
            totalRemaining = totalRemaining - ${line.quantity}
        WHERE id = ${line.configId} AND totalRemaining >= ${line.quantity}
      `);
      if (affectedRows(update) !== 1) throw new AppError(409, `${line.ticketName} is sold out.`);
    }

    const ticketsToCreate = lines.flatMap((line) =>
      Array.from({ length: line.quantity }, () => {
        const id = generateTicketIdentifier(line.eventName);
        return { orderId, eventTicketId: line.eventTicketId, ticketIdentifier: id, qrCodeUrl: `${config.appUrl}/t/${id}` };
      }),
    );

    await tx.insert(ticketOrderItems).values(ticketsToCreate);
    await tx.insert(payments).values({
      orderId,
      provider: 'paystack',
      reference,
      amount: totals.totalAmount.toFixed(2),
      subtotal: totals.subtotal.toFixed(2),
      feeAmount: totals.feeAmount.toFixed(2),
      currency,
      status: 'Completed',
      paidAt: now(),
    } as typeof payments.$inferInsert);
    await tx.update(ticketOrders).set({ status: 'Completed' }).where(eq(ticketOrders.id, orderId));
    await ensureAccountForOrder(tx, orderId, email);

    const [attendee] = await tx
      .select({ email: ticketOrderUserDetails.email, phoneNumber: ticketOrderUserDetails.phoneNumber })
      .from(ticketOrderUserDetails)
      .where(eq(ticketOrderUserDetails.orderId, orderId));

    return { orderId, attendee, total: totals.totalAmount, tickets: await loadIssuedTickets(tx, orderId) };
  });
}

export function isCheckoutV2Webhook(payload: any) {
  return payload.data?.metadata?.flow === 'ticket_checkout_v2';
}
