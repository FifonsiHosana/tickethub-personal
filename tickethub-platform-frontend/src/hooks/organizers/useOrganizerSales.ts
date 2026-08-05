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
  summary: () => [...organizerSalesKeys.all, "summary"] as const,
  revenue: (from: string, to: string) =>
    [...organizerSalesKeys.all, "revenue", { from, to }] as const,
  ticketBreakdown: () =>
    [...organizerSalesKeys.all, "ticket-breakdown"] as const,
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

export function useSalesSummary() {
  return useQuery({
    queryKey: organizerSalesKeys.summary(),
    queryFn: getSalesSummary,
  });
}

export function useRevenueBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: organizerSalesKeys.revenue(from, to),
    queryFn: () => getRevenueBreakdown(from, to),
    enabled: !!from && !!to,
  });
}

export function useTicketSalesBreakdown() {
  return useQuery({
    queryKey: organizerSalesKeys.ticketBreakdown(),
    queryFn: getTicketSalesBreakdown,
  });
}

export interface RecentOrdersParams {
  eventId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
}

export function useRecentOrders(params: RecentOrdersParams = {}) {
  return useQuery({
    queryKey: [...organizerSalesKeys.all, "recent-orders", params],
    queryFn: () => getOrganizerSales(params),
    placeholderData: (previousData) => previousData,
  });
}
