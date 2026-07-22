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

export interface GetOrganizerEventsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "Draft" | "Published" | "Completed" | "Cancelled";
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type GetOrganizerEventsResponse = {
  data: OrganizerEventResponse[];
  pagination: PaginationMeta;
};

export interface OrganizerEventResponse {
  id: number;
  title: string;
  description?: string;
  status: "Draft" | "Published" | "Completed" | "Cancelled";
  approvalStatus: "Pending" | "Approved" | "Rejected";
  capacity: number;
  dateAndTime: string;
  createdAt: string;
  updatedAt: string;
}

export async function getOrganizerEvents(
  params?: GetOrganizerEventsParams,
): Promise<GetOrganizerEventsResponse> {
  const response = await axiosInstance.get("/organizer/events", { params });
  return response.data;
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
