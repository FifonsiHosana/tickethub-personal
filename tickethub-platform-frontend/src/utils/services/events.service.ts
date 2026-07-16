import { axiosInstance } from "@/utils/api/axiosInstance";

import type { Event } from "@/types/event.types";

import type { EventTicket } from "@/types/ticket.types";

export async function getPublishedEvents(): Promise<Event[]> {
  const response = await axiosInstance.get("/api/events");

  return response.data;
}

export async function getEventById(id: string): Promise<Event> {
  const response = await axiosInstance.get(`/api/events/${id}`);

  return response.data;
}

export async function getEventTickets(eventId: string): Promise<EventTicket[]> {
  const response = await axiosInstance.get(`/api/events/${eventId}/tickets`);

  return response.data;
}
