import { getOrganizerDashboardData } from "@/utils/services/organizers/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export function useOrganizerDashboardData() {
  return useQuery({
    queryKey: ["organizer-dashboard"],
    queryFn: getOrganizerDashboardData,
  });
}
