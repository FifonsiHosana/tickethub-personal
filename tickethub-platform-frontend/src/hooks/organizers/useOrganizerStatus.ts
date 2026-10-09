import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  changeTicketStatus,
  type ChangeTicketStatusPayload,
} from "@/utils/services/organizers/tickets.service";
import {
  organizerOrdersKeys,
  type GetOrganizerOrdersResponse,
} from "@/hooks/organizers/useOrganizerOrders";

type OrdersSnapshot = [readonly unknown[], GetOrganizerOrdersResponse | undefined];

export const useChangeOrganizerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ChangeTicketStatusPayload) =>
      changeTicketStatus(payload),
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries({ queryKey: organizerOrdersKeys.all });

      const previousOrders = queryClient.getQueriesData<GetOrganizerOrdersResponse>({
        queryKey: organizerOrdersKeys.all,
      });
      const numericOrderId = Number(orderId);

      queryClient.setQueriesData<GetOrganizerOrdersResponse>(
        { queryKey: organizerOrdersKeys.all },
        (current) => {
          if (!current) return current;

          return {
            ...current,
            data: current.data.map((order) =>
              order.orderId === numericOrderId
                ? { ...order, status: "Completed" }
                : order,
            ),
          };
        },
      );

      return { previousOrders };
    },
    onError: (_error, _payload, context) => {
      context?.previousOrders.forEach(([queryKey, data]: OrdersSnapshot) => {
        queryClient.setQueryData(queryKey, data);
      });
      toast.error("Failed to complete order. Status was restored.");
    },
    onSuccess: () => {
      toast.success("Order marked as completed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: organizerOrdersKeys.all });
    },
  });
};