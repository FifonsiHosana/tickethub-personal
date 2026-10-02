import { getOrganizerDashboardData } from "@/utils/services/organizers/dashboard.service";
import type { DashboardParams } from "@/utils/services/organizers/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export function useOrganizerDashboardData(params?: DashboardParams) {
  return useQuery({
    queryKey: ["organizer-dashboard", params],
    queryFn: () => getOrganizerDashboardData(params),
    placeholderData: (previousData) => previousData, // no flicker on refetch
    refetchInterval: 3_000, // every 5s
    refetchIntervalInBackground: false, // pause when tab is hidden
    refetchOnWindowFocus: true, // instant refresh when they return
    refetchOnReconnect: true,
  });
}
