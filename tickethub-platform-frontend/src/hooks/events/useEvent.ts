import { useQuery } from "@tanstack/react-query";

import {
  getPublishedEvents,
  getEventById,
  getEventTickets,
} from "@/utils/services/events.service";

import { useParams } from "react-router";

const eventQueryKeys = {
  all: ["events"],

  detail: (id: string) => ["events", id],

  tickets: (id: string) => ["events", id, "tickets"],
};

export function useEvents() {
  return useQuery({
    queryKey: eventQueryKeys.all,

    queryFn: getPublishedEvents,

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
