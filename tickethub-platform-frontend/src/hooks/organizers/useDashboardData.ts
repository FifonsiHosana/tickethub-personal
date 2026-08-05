import { getOrganizerDashboardData } from "@/utils/services/organizers/dashboard.service";
import type { DashboardParams } from "@/utils/services/organizers/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export function useOrganizerDashboardData(params?: DashboardParams) {
  return useQuery({
    queryKey: ["organizer-dashboard", params],
    queryFn: () => getOrganizerDashboardData(params),
    placeholderData: (previousData) => previousData,
  });
}
