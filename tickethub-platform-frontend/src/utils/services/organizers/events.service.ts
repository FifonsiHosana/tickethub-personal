import { axiosInstance } from "@/utils/api/axiosInstance";
import type { Category } from "@/types/event.types";

export interface CreateEventPayload {
  title: string;
  description?: string;
  eventVenueId?: number;
  venue?: CreateVenuePayload;
  capacity: number;
  dateAndTime: string;
  dateAndTimeEnd?: string;
  termsAndConditions?: string;
  categoryIds?: number[];
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
  dateAndTimeEnd?: string;
  venue?: string | null;
  banner?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function getOrganizerEvents(
  params?: GetOrganizerEventsParams,
): Promise<GetOrganizerEventsResponse> {
  const response = await axiosInstance.get("/organizer/events", { params });
  return response.data;
}

export interface OrganizerEventTicketDetail {
  id: number;
  name: string;
  ticketType?: string | null;
  ticketTypeId?: number | null;
  price: string | number;
  totalCount: number;
  totalSold: number;
  remaining: number;
  salesStartDate?: string | null;
  salesEndDate?: string | null;
  benefits?: string | null;
}

export interface OrganizerEventDetail {
  id: number;
  title: string;
  description?: string | null;
  status: "Draft" | "Published" | "Completed" | "Cancelled";
  approvalStatus: "Pending" | "Approved" | "Rejected";
  capacity: number;
  dateAndTime: string;
  dateAndTimeEnd?: string | null;
  eventVenueId?: number | null;
  termsAndConditions?: string | null;
  categoryIds?: number[];
  categoryNames?: string[];
  venue?: {
    venue_name: string;
    address?: string | null;
    city_or_town: string;
    country: string;
    googleMapLink?: string | null;
  } | null;
  media?: { id: number; eventId: number; imageUrl: string; type: string }[];
  tickets?: OrganizerEventTicketDetail[];
  createdAt: string;
  updatedAt: string;
}

export async function getOrganizerEventById(
  eventId: number,
): Promise<OrganizerEventDetail> {
  const response = await axiosInstance.get(`/organizer/events/${eventId}`);
  return response.data.data;
}

export async function createOrganizerEvent(payload: CreateEventPayload) {
  const response = await axiosInstance.post("/organizer/events", payload);
  return response.data;
}

export interface TicketPayload {
  name: string;
  ticketTypeId?: number;
  ticketTypeName?: string;
  ticketTypeDescription?: string;
  price: number;
  totalCount?: number;
  salesStartDate?: string;
  salesEndDate?: string;
  benefits?: string;
}

export interface CreateEventWithTicketsPayload {
  title: string;
  description?: string;
  eventVenueId?: number;
  venue?: CreateVenuePayload;
  capacity: number;
  dateAndTime: string;
  dateAndTimeEnd?: string;
  termsAndConditions?: string;
  categoryIds?: number[];
  media?: { imageUrl: string; type: "Banner" | "Gallery" | "Sponsor" }[];
  tickets: TicketPayload[];
}

export async function createOrganizerEventWithTickets(
  payload: CreateEventWithTicketsPayload,
) {
  const response = await axiosInstance.post(
    "/organizer/events/with-tickets",
    payload,
  );
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

export async function cancelOrganizerEvent(eventId: number) {
  const response = await axiosInstance.patch(`/organizer/events/${eventId}/cancel`);
  return response.data;
}

export async function getEventVenues() {
  const response = await axiosInstance.get("/organizer/event-venues");

  return response.data.data;
}

export interface CreateVenuePayload {
  venue_name: string;
  address?: string;
  city_or_town: string;
  country: string;
  googleMapLink?: string;
}

export async function createEventVenue(payload: CreateVenuePayload) {
  const response = await axiosInstance.post("/organizer/event-venues", payload);
  return response.data.data;
}

export interface CreateCategoryPayload {
  name: string;
}

export async function createCategory(payload: CreateCategoryPayload) {
  const response = await axiosInstance.post<{ success: boolean; data: Category }>(
    "/organizer/categories",
    payload,
  );
  return response.data.data;
}
