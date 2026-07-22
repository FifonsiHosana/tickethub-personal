import { axiosInstance } from "@/utils/api/axiosInstance";

import type {
  Event,
  GetPublishedEventsParams,
  GetPublishedEventsResponse,
  Category,
} from "@/types/event.types";

import type { EventTicket } from "@/types/ticket.types";

export async function getPublishedEvents(
  params?: GetPublishedEventsParams,
): Promise<GetPublishedEventsResponse> {
  const response = await axiosInstance.get("/events", { params });
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await axiosInstance.get("/events/categories");
  return response.data.data;
}

export async function getEventById(id: string): Promise<Event> {
  const response = await axiosInstance.get(`/events/${id}`);
  return response.data.data;
}

export async function getEventTickets(eventId: string): Promise<EventTicket[]> {
  const response = await axiosInstance.get(`/events/${eventId}/tickets`);
  return response.data.data;
}
