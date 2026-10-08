import { format } from "date-fns";
import type { OrderHistoryEventBreakdown, OrderHistoryOrder } from "@/utils/services/attendees/orders.service";

export function formatOrderDate(value?: string | null) {
  return value ? format(new Date(value), "MMM d, yyyy • h:mm a") : "—";
}

export function eventSummary(order?: OrderHistoryOrder | null) {
  if (!order?.events.length) return "No event details";

  const titles = order.events.map((event) => event.eventTitle).filter(Boolean);
  if (titles.length <= 1) return titles[0] ?? "No event details";

  return `${titles[0]} +${titles.length - 1} more`;
}

export function ticketCountLabel(count: number) {
  return `${count} ticket${count === 1 ? "" : "s"}`;
}

export function ticketLabel(event: OrderHistoryEventBreakdown) {
  return event.ticketSummary || event.ticketType || "Ticket type";
}
