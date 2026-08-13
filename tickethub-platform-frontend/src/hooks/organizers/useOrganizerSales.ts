import { useQuery } from "@tanstack/react-query";
import {
  getOrganizerSales,
  getSaleById,
  getEventSales,
  getSalesSummary,
  getRevenueBreakdown,
  getTicketSalesBreakdown,
  type GetOrganizerSalesParams,
  type GetSalesSummaryParams,
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
  summary: (params: GetSalesSummaryParams) =>
    [...organizerSalesKeys.all, "summary", params] as const,
  revenue: (from: string, to: string, filters?: GetSalesSummaryParams) =>
    [...organizerSalesKeys.all, "revenue", { from, to, ...filters }] as const,
  ticketBreakdown: (params: GetSalesSummaryParams) =>
    [...organizerSalesKeys.all, "ticket-breakdown", params] as const,
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

export function useSalesSummary(params: GetSalesSummaryParams = {}) {
  return useQuery({
    queryKey: organizerSalesKeys.summary(params),
    queryFn: () => getSalesSummary(params),
  });
}

export function useRevenueBreakdown(
  from: string,
  to: string,
  filters?: GetSalesSummaryParams,
) {
  return useQuery({
    queryKey: organizerSalesKeys.revenue(from, to, filters),
    queryFn: () => getRevenueBreakdown(from, to, filters),
    enabled: !!from && !!to,
  });
}

export function useTicketSalesBreakdown(params: GetSalesSummaryParams = {}) {
  return useQuery({
    queryKey: organizerSalesKeys.ticketBreakdown(params),
    queryFn: () => getTicketSalesBreakdown(params),
  });
}
