import {
  changeTicketStatus,
  type ChangeTicketStatusPayload,
} from "@/utils/services/organizers/tickets.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useChangeOrganizerStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ChangeTicketStatusPayload) =>
      changeTicketStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-orders"] });
    },
  });
};
