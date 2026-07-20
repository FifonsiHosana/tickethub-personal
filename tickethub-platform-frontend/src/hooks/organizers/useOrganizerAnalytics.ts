import { useQuery } from "@tanstack/react-query";
import {
  getOverviewAnalytics,
  getRevenueTrend,
  getEventPerformance,
  getTicketPerformance,
  type RevenueTrendParams,
} from "@/utils/services/organizers/analytics.service";

export const analyticsKeys = {
  all: ["organizer-analytics"] as const,
  overview: () => [...analyticsKeys.all, "overview"] as const,
  revenueTrend: (params: RevenueTrendParams) =>
    [...analyticsKeys.all, "revenue-trend", params] as const,
  events: () => [...analyticsKeys.all, "events"] as const,
  tickets: () => [...analyticsKeys.all, "tickets"] as const,
};

export function useOverviewAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.overview(),
    queryFn: getOverviewAnalytics,
  });
}

export function useRevenueTrend(params: RevenueTrendParams) {
  return useQuery({
    queryKey: analyticsKeys.revenueTrend(params),
    queryFn: () => getRevenueTrend(params),
    enabled: !!params.from && !!params.to,
  });
}

export function useEventPerformance() {
  return useQuery({
    queryKey: analyticsKeys.events(),
    queryFn: getEventPerformance,
  });
}

export function useTicketPerformance() {
  return useQuery({
    queryKey: analyticsKeys.tickets(),
    queryFn: getTicketPerformance,
  });
}
