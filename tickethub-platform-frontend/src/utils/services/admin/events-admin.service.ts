import { axiosInstance } from "@/utils/api/axiosInstance";

export type AdminEvent = {
  id: number;
  title: string;
  status: string;
  approvalStatus: string | null;
  dateAndTime: string;
  capacity: number;
  venueName: string | null;
  organizerFirstName: string | null;
  organizerLastName: string | null;
  organizerEmail: string | null;
  createdAt: string;
};

export type AdminEventDetail = AdminEvent & {
  description: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  termsAndConditions: string | null;
  organizerId: number | null;
  images: { imageUrl: string; type: string }[];
  categories: { id: number; name: string }[];
};

export type GetAdminEventsParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  approvalStatus?: string;
  status?: string;
  organizerId?: number;
};

export async function getAdminEvents(
  params?: GetAdminEventsParams,
): Promise<{ data: AdminEvent[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  const response = await axiosInstance.get("admin/events", { params });
  return response.data;
}

export async function getAdminEventDetail(
  eventId: number,
): Promise<AdminEventDetail> {
  const response = await axiosInstance.get(`admin/events/${eventId}`);
  return response.data.data;
}

export async function approveEvent(
  eventId: number,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/events/${eventId}/approve`,
  );
  return response.data;
}

export async function rejectEvent(
  eventId: number,
  reason: string,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/events/${eventId}/reject`,
    { reason },
  );
  return response.data;
}
