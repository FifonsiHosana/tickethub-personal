import { useQuery } from "@tanstack/react-query";
import {
  getAdminOverview,
  getRevenueTrend,
  getUserTrend,
  getEventStats,
  getOrganizerPerformance,
} from "@/utils/services/admin/analytics.service";

export function useAdminOverview(from?: string, to?: string) {
  return useQuery({
    queryKey: ["admin-analytics-overview", from, to],
    queryFn: () => getAdminOverview(from, to),
  });
}

export function useRevenueTrend(from?: string, to?: string) {
  return useQuery({
    queryKey: ["admin-analytics-revenue", from, to],
    queryFn: () => getRevenueTrend(from, to),
  });
}

export function useUserTrend(from?: string, to?: string) {
  return useQuery({
    queryKey: ["admin-analytics-users", from, to],
    queryFn: () => getUserTrend(from, to),
  });
}

export function useEventStats() {
  return useQuery({
    queryKey: ["admin-analytics-event-stats"],
    queryFn: getEventStats,
  });
}

export function useOrganizerPerformance() {
  return useQuery({
    queryKey: ["admin-analytics-organizer-perf"],
    queryFn: getOrganizerPerformance,
  });
}
