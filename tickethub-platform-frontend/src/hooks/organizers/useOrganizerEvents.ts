import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getOrganizerEvents,
  getOrganizerEventById,
  createOrganizerEvent,
  createOrganizerEventWithTickets,
  updateOrganizerEvent,
  deleteOrganizerEvent,
  cancelOrganizerEvent,
  getEventVenues,
  createEventVenue,
  type CreateEventPayload,
  type CreateEventWithTicketsPayload,
  type UpdateEventPayload,
  type GetOrganizerEventsParams,
  type CreateVenuePayload,
} from "@/utils/services/organizers/events.service";

export function useEventVenues() {
  return useQuery({
    queryKey: ["organizer-event-venues"],
    queryFn: getEventVenues,
  });
}

export function useCreateEventVenue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVenuePayload) => createEventVenue(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-event-venues"] });
    },
  });
}

export function useOrganizerEvents(params?: GetOrganizerEventsParams) {
  return useQuery({
    queryKey: ["organizer-events", params],
    queryFn: () => getOrganizerEvents(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useOrganizerEvent(eventId: number) {
  return useQuery({
    queryKey: ["organizer-event", eventId],
    queryFn: () => getOrganizerEventById(eventId),
    enabled: !!eventId,
  });
}

export function useCreateOrganizerEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) => createOrganizerEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizer-events"],
      });
    },
  });
}

export function useCreateOrganizerEventWithTickets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventWithTicketsPayload) =>
      createOrganizerEventWithTickets(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizer-events"],
      });
    },
  });
}

export function useUpdateOrganizerEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number;
      payload: UpdateEventPayload;
    }) => updateOrganizerEvent(eventId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organizer-events"],
      });
      queryClient.invalidateQueries({
        queryKey: ["organizer-event", variables.eventId],
      });
    },
  });
}

export function useCancelOrganizerEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => cancelOrganizerEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    },
  });
}

export function useDeleteOrganizerEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: number) => deleteOrganizerEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizer-events"],
      });
    },
  });
}
