import { useMutation } from "@tanstack/react-query";
import { purchaseTicketPayment } from "@/utils/services/attendees/finance.service";

export function usePayTicket() {
  return useMutation({
    mutationFn: purchaseTicketPayment,
  });
}
