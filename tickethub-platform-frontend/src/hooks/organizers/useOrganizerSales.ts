import { useQuery } from "@tanstack/react-query";
import {
  getOrganizerSales,
  getSaleById,
  getEventSales,
  getSalesSummary,
  getRevenueBreakdown,
  getTicketSalesBreakdown,
  type GetOrganizerSalesParams,
} from "@/utils/services/organizers/sales.service";

export const organizerSalesKeys = {
  all: ["organizer-sales"] as const,

  // Lists and filters
  lists: () => [...organizerSalesKeys.all, "list"] as const,
  list: (params: GetOrganizerSalesParams) =>
    [...organizerSalesKeys.lists(), params] as const,

  // Specific order details
  details: () => [...organizerSalesKeys.all, "detail"] as const,
  detail: (orderId: number) =>
    [...organizerSalesKeys.details(), orderId] as const,

  // Specific event sales
  eventSales: (eventId: number) =>
    [...organizerSalesKeys.all, "event", eventId] as const,

  // Dashboards & Summaries
  summary: (from?: string, to?: string) =>
    [...organizerSalesKeys.all, "summary", { from, to }] as const,
  revenue: (from: string, to: string) =>
    [...organizerSalesKeys.all, "revenue", { from, to }] as const,
  ticketBreakdown: (from?: string, to?: string) =>
    [...organizerSalesKeys.all, "ticket-breakdown", { from, to }] as const,
};

export function useOrganizerSales(params: GetOrganizerSalesParams = {}) {
  return useQuery({
    queryKey: organizerSalesKeys.list(params),
    queryFn: () => getOrganizerSales(params),
    placeholderData: (previousData) => previousData, // Keeps previous page data while fetching the next
  });
}

export function useSaleDetails(orderId: number) {
  return useQuery({
    queryKey: organizerSalesKeys.detail(orderId),
    queryFn: () => getSaleById(orderId),
    enabled: !!orderId,
  });
}

export function useEventSales(eventId: number) {
  return useQuery({
    queryKey: organizerSalesKeys.eventSales(eventId),
    queryFn: () => getEventSales(eventId),
    enabled: !!eventId,
  });
}

export function useSalesSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: organizerSalesKeys.summary(from, to),
    queryFn: () => getSalesSummary(from, to),
  });
}

export function useRevenueBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: organizerSalesKeys.revenue(from, to),
    queryFn: () => getRevenueBreakdown(from, to),
    enabled: !!from && !!to,
  });
}

export function useTicketSalesBreakdown(from?: string, to?: string) {
  return useQuery({
    queryKey: organizerSalesKeys.ticketBreakdown(from, to),
    queryFn: () => getTicketSalesBreakdown(from, to),
  });
}
