import { useQuery } from "@tanstack/react-query";

import {
  getPublishedEvents,
  getEventById,
  getEventTickets,
  getCategories,
} from "@/utils/services/attendees/events.service";

import { useParams } from "react-router";
import type { GetPublishedEventsParams } from "@/types/event.types";

const eventQueryKeys = {
  all: (params?: GetPublishedEventsParams) => ["events", params ?? {}],
  detail: (id: string) => ["events", id],
  tickets: (id: string) => ["events", id, "tickets"],
  categories: ["categories"],
};

export function useEvents(params?: GetPublishedEventsParams) {
  return useQuery({
    queryKey: eventQueryKeys.all(params),
    queryFn: () => getPublishedEvents(params),
    staleTime: 1000 * 60 * 10,
    placeholderData: (previousData) => previousData,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: eventQueryKeys.categories,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 10,
  });
}

export function useEvent() {
  const { id } = useParams<{ id: string }>();

  return useQuery({
    queryKey: eventQueryKeys.detail(id as string),
    queryFn: () => getEventById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useEventTickets() {
  const { id } = useParams<{ id: string }>();

  return useQuery({
    queryKey: eventQueryKeys.tickets(id as string),
    queryFn: () => getEventTickets(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}
