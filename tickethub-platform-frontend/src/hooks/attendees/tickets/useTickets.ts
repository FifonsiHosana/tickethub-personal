import { useMutation, useQuery } from "@tanstack/react-query";

import {
  purchaseTickets,
  getTicketByIdentifier,

} from "@/utils/services/attendees/tickets.service";
import { useParams } from "react-router";

export function usePurchaseTickets() {
  return useMutation({
    mutationFn: purchaseTickets,
  });
}

export function useGetTicketByIdentifier() {
  const { ticketIdentifier } = useParams<{ ticketIdentifier: string }>();

  return useQuery({
    queryKey: ["ticket-identifer"],
    queryFn: () => getTicketByIdentifier(ticketIdentifier as string),
    enabled: !!ticketIdentifier,
    staleTime: 1000 * 60 * 10,
  });
}

