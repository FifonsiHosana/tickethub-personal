import { db } from '@/db/client.js';
import { eq, sql } from 'drizzle-orm';
import {
  platformSettings,
  ticketConfigurations,
  ticketOrderItems,
  eventTickets,
} from '@/db/schema/index.js';

export const PROCESSING_FEE_PERCENTAGE_KEY = 'processing_fee_percentage';
export const DEFAULT_PROCESSING_FEE_PERCENTAGE = 2;

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getProcessingPercentageFee() {
  const [row] = await db
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

export async function getOrderSubtotalFromDb(orderId: number) {
  const [row] = await db
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

export async function computeOrderBreakdown(orderId: number) {
  const subtotal = await getOrderSubtotalFromDb(orderId);
  const processingPercentageFee = await getProcessingPercentageFee();
  const feeAmount = round2(
    (subtotal * processingPercentageFee) / 100,
  );
  const totalAmount = round2(subtotal + feeAmount);

  return { subtotal, feeAmount, totalAmount };
}