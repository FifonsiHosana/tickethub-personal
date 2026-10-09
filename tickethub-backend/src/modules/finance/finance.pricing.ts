import { db } from '@/db/client.js';
import { count, eq, sql } from 'drizzle-orm';
import {
  platformSettings,
  ticketConfigurations,
  ticketOrderItems,
  eventTickets,
} from '@/db/schema/index.js';

export const PROCESSING_FEE_PERCENTAGE_KEY = 'processing_fee_percentage';
export const DEFAULT_PROCESSING_FEE_PERCENTAGE = 2;

type DbLike = typeof db;

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getProcessingPercentageFee(dbLike: DbLike = db) {
  const [row] = await dbLike
    .select({ value: platformSettings.value })
    .from(platformSettings)
    .where(eq(platformSettings.key, PROCESSING_FEE_PERCENTAGE_KEY))
    .limit(1);

  if (!row) return DEFAULT_PROCESSING_FEE_PERCENTAGE;

  const parsed = Number(row.value);
  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_PROCESSING_FEE_PERCENTAGE;
}

export async function getOrderSubtotalFromDb(orderId: number, dbLike: DbLike = db) {
  const [row] = await dbLike
    .select({
      subtotal: sql<string>`COALESCE(SUM(${ticketConfigurations.price}), 0)`,
    })
    .from(ticketOrderItems)
    .innerJoin(
      eventTickets,
      eq(ticketOrderItems.eventTicketId, eventTickets.id),
    )
    .innerJoin(
      ticketConfigurations,
      eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
    )
    .where(eq(ticketOrderItems.orderId, orderId));

  return Number(row?.subtotal ?? 0);
}

export async function getOrderTicketQuantityFromDb(
  orderId: number,
  dbLike: DbLike = db,
) {
  const [row] = await dbLike
    .select({ quantity: count() })
    .from(ticketOrderItems)
    .where(eq(ticketOrderItems.orderId, orderId));

  return Number(row?.quantity ?? 0);
}

export async function computeOrderBreakdown(
  orderId: number,
  ticketQuantity?: number,
  dbLike: DbLike = db,
) {
  const subtotal = await getOrderSubtotalFromDb(orderId, dbLike);
  const resolvedTicketQuantity =
    Number.isFinite(ticketQuantity) && Number(ticketQuantity) > 0
      ? Number(ticketQuantity)
      : await getOrderTicketQuantityFromDb(orderId, dbLike);

  const feeAmount = 10 * resolvedTicketQuantity;
  const totalAmount = round2(subtotal + feeAmount);

  return {
    subtotal,
    feeAmount,
    totalAmount,
    ticketQuantity: resolvedTicketQuantity,
  };
}
