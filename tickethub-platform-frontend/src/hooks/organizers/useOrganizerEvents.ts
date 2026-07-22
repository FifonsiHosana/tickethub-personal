import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getOrganizerEvents,
  getOrganizerEventById,
  createOrganizerEvent,
  updateOrganizerEvent,
  deleteOrganizerEvent,
  getEventVenues,
  type CreateEventPayload,
  type UpdateEventPayload,
  type GetOrganizerEventsParams,
} from "@/utils/services/organizers/events.service";

export function useEventVenues() {
  return useQuery({
    queryKey: ["organizer-event-venues"],
    queryFn: getEventVenues,
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
