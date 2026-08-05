import { useQuery } from "@tanstack/react-query";

import {
  getOrderHistory,
  type OrderHistoryParams,
} from "@/utils/services/attendees/orders.service";

export function useOrderHistory(params?: OrderHistoryParams) {
  return useQuery({
    queryKey: ["attendee-order-history", params],
    queryFn: () => getOrderHistory(params),
    placeholderData: (previousData) => previousData,
  });
}