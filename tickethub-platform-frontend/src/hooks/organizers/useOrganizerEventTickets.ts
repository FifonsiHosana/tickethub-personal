import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventTickets,
  createEventTicket,
  updateTicket,
  deleteTicket,
  getTicketTypes,
  createTicketType,
  type CreateTicketPayload,
  type UpdateTicketPayload,
  type CreateTicketTypePayload,
} from "@/utils/services/organizers/tickets.service";

export function useEventTickets(eventId: number | null) {
  return useQuery({
    queryKey: ["organizer-tickets", eventId],
    queryFn: () => getEventTickets(eventId!),
    enabled: !!eventId,
  });
}

export function useCreateEventTicket(eventId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketPayload) =>
      createEventTicket(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-tickets", eventId] });
    },
  });
}

export function useUpdateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      payload,
    }: {
      ticketId: number;
      payload: UpdateTicketPayload;
    }) => updateTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-tickets"] });
    },
  });
}

export function useDeleteTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: number) => deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-tickets"] });
    },
  });
}

export function useTicketTypes() {
  return useQuery({
    queryKey: ["organizer-ticket-types"],
    queryFn: getTicketTypes,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateTicketType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketTypePayload) =>
      createTicketType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-ticket-types"] });
    },
  });
}
