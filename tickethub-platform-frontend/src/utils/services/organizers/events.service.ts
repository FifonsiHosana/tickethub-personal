import { axiosInstance } from "@/utils/api/axiosInstance";

export interface CreateEventPayload {
  title: string;
  description?: string;
  eventVenueId: number;
  capacity: number;
  dateAndTime: string;
  termsAndConditions?: string;
  media?: {
    imageUrl: string;
    type: "Banner" | "Gallery" | "Sponsor";
  }[];
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export async function getOrganizerEvents() {
  const response = await axiosInstance.get("/organizer/events");
  return response.data.data;
}

export async function getOrganizerEventById(eventId: number) {
  const response = await axiosInstance.get(`/organizer/events/${eventId}`);
  return response.data;
}

export async function createOrganizerEvent(payload: CreateEventPayload) {
  const response = await axiosInstance.post("/organizer/events", payload);
  return response.data;
}

export async function updateOrganizerEvent(
  eventId: number,
  payload: UpdateEventPayload,
) {
  const response = await axiosInstance.patch(
    `/organizer/events/${eventId}`,
    payload,
  );

  return response.data;
}

export async function deleteOrganizerEvent(eventId: number) {
  const response = await axiosInstance.delete(`/organizer/events/${eventId}`);

  return response.data;
}

export async function getEventVenues() {
  const response = await axiosInstance.get("/organizer/event-venues");

  return response.data.data;
}
