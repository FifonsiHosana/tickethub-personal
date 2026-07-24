import { axiosInstance } from "@/utils/api/axiosInstance";

export interface AttendeeResponse {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  ticketType: string;
  ticketIdentifier: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  price: string;
}

export interface GetAttendeesParams {
  page?: number;
  pageSize?: number;
}

export interface GetAttendeesResponse {
  data: AttendeeResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function getEventAttendees(
  eventId: number,
  params?: GetAttendeesParams,
): Promise<GetAttendeesResponse> {
  const response = await axiosInstance.get(
    `/organizer/events/${eventId}/attendees`,
    { params },
  );
  return response.data;
}
