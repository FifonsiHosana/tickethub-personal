import { useMutation } from "@tanstack/react-query";

import { purchaseTickets } from "@/utils/services/attendees/tickets.service";

export function usePurchaseTickets() {
  return useMutation({
    mutationFn: purchaseTickets,
  });
}
