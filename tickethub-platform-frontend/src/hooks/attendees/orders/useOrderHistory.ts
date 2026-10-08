import { useQuery } from "@tanstack/react-query";

import {
  getOrderHistory,
  getOrderHistoryDetail,
  type OrderHistoryParams,
} from "@/utils/services/attendees/orders.service";

export function useOrderHistory(params?: OrderHistoryParams) {
  return useQuery({
    queryKey: ["attendee-order-history", params],
    queryFn: () => getOrderHistory(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrderHistoryDetail(orderId?: number) {
  return useQuery({
    queryKey: ["attendee-order-history-detail", orderId],
    queryFn: () => getOrderHistoryDetail(orderId as number),
    enabled: Number.isFinite(orderId),
  });
}
