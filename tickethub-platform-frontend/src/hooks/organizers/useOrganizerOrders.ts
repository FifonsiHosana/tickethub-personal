import { useQuery } from "@tanstack/react-query";
import {
  getOrganizerOrders,
  type GetOrganizerOrdersParams,
} from "@/utils/services/organizers/orders.service";

export const organizerOrdersKeys = {
  all: ["organizer-orders"] as const,

  // Lists and filters
  lists: () => [...organizerOrdersKeys.all, "list"] as const,
  list: (params: GetOrganizerOrdersParams) =>
    [...organizerOrdersKeys.lists(), params] as const,
};

export function useOrganizerOrders(params: GetOrganizerOrdersParams = {}) {
  return useQuery({
    queryKey: organizerOrdersKeys.list(params),
    queryFn: () => getOrganizerOrders(params),
    placeholderData: (previousData) => previousData,
  });
}
