import { useQuery } from "@tanstack/react-query";
import {
  getOverviewAnalytics,
  getRevenueTrend,
  getEventPerformance,
  getTicketPerformance,
  type RevenueTrendParams,
  type AnalyticsSearchParams,
} from "@/utils/services/organizers/analytics.service";

export const analyticsKeys = {
  all: ["organizer-analytics"] as const,
  overview: (from?: string, to?: string) =>
    [...analyticsKeys.all, "overview", { from, to }] as const,
  revenueTrend: (params: RevenueTrendParams) =>
    [...analyticsKeys.all, "revenue-trend", params] as const,
  events: (params?: AnalyticsSearchParams) =>
    [...analyticsKeys.all, "events", params] as const,
  tickets: (params?: AnalyticsSearchParams) =>
    [...analyticsKeys.all, "tickets", params] as const,
};

export function useOverviewAnalytics(from?: string, to?: string) {
  return useQuery({
    queryKey: analyticsKeys.overview(from, to),
    queryFn: () => getOverviewAnalytics({ from, to }),
  });
}

export function useRevenueTrend(params: RevenueTrendParams) {
  return useQuery({
    queryKey: analyticsKeys.revenueTrend(params),
    queryFn: () => getRevenueTrend(params),
    enabled: !!params.from && !!params.to,
  });
}

export function useEventPerformance(params?: AnalyticsSearchParams) {
  return useQuery({
    queryKey: analyticsKeys.events(params),
    queryFn: () => getEventPerformance(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useTicketPerformance(params?: AnalyticsSearchParams) {
  return useQuery({
    queryKey: analyticsKeys.tickets(params),
    queryFn: () => getTicketPerformance(params),
    placeholderData: (previousData) => previousData,
  });
}
