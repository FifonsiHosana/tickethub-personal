import {
  getOrderFromReference,
  type OrderFromReferenceParams,
} from "@/utils/services/attendees/orders.service";
import { useQuery } from "@tanstack/react-query";

export function useOrdersFromReference(params?: OrderFromReferenceParams) {
  return useQuery({
    queryKey: ["attendee-order-from-reference", params?.reference, params?.email],
    queryFn: () => getOrderFromReference(params as OrderFromReferenceParams),
    enabled: !!params?.reference,
    placeholderData: (previousData) => previousData,
    refetchInterval: (query) => {
      if (query.state.data === null) {
        return 2000;
      }
      return false;
    },
  });
}
