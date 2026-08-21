import { axiosInstance } from "@/utils/api/axiosInstance";

export type CreateTicketPayload = {
  name: string;
  ticketTypeId?: number;
  ticketTypeName?: string;
  ticketTypeDescription?: string;
  price: number;
  totalCount?: number;
  salesStartDate?: string;
  salesEndDate?: string;
  benefits?: string;
};

export type UpdateTicketPayload = {
  name?: string;
  price?: number;
  totalCount?: number;
  salesStartDate?: string;
  salesEndDate?: string;
  benefits?: string;
};

export type TicketResponse = {
  id: number;
  name: string;
  ticketType: string | null;
  ticketTypeId: number | null;
  description: string | null;
  price: string;
  totalCount: number;
  totalSold: number;
  remaining: number;
  salesStartDate: string | null;
  salesEndDate: string | null;
  benefits: string | null;
};

export type TicketTypeResponse = {
  id: number;
  name: string;
  description: string | null;
};

export type CreateTicketTypePayload = {
  name: string;
  description?: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export async function getEventTickets(
  eventId: number,
): Promise<TicketResponse[]> {
  const response = await axiosInstance.get<ApiResponse<TicketResponse[]>>(
    `/organizer/tickets/events/${eventId}/tickets`,
  );
  return response.data.data;
}

export async function createEventTicket(
  eventId: number,
  payload: CreateTicketPayload,
): Promise<{ ticketId: number; ticketConfigurationId: number }> {
  const response = await axiosInstance.post<
    ApiResponse<{ ticketId: number; ticketConfigurationId: number }>
  >(`/organizer/tickets/events/${eventId}/tickets`, payload);
  return response.data.data;
}

export async function updateTicket(
  ticketId: number,
  payload: UpdateTicketPayload,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch<ApiResponse<{ message: string }>>(
    `/organizer/tickets/tickets/${ticketId}`,
    payload,
  );
  return response.data.data;
}

export async function deleteTicket(ticketId: number): Promise<void> {
  await axiosInstance.delete(`/organizer/tickets/tickets/${ticketId}`);
}

export async function getTicketTypes(): Promise<TicketTypeResponse[]> {
  const response = await axiosInstance.get<ApiResponse<TicketTypeResponse[]>>(
    "/organizer/tickets/ticket-types",
  );
  return response.data.data;
}

export async function createTicketType(
  payload: CreateTicketTypePayload,
): Promise<TicketTypeResponse> {
  const response = await axiosInstance.post<ApiResponse<TicketTypeResponse>>(
    "/organizer/tickets/ticket-types",
    payload,
  );
  return response.data.data;
}

export async function checkInTicket(
  ticketIdentifier: string,
): Promise<{ message: string; ticketIdentifier: string }> {
  const response = await axiosInstance.post<
    ApiResponse<{ message: string; ticketIdentifier: string }>
  >("/tickets/check-in", { ticketIdentifier });
  return response.data.data;
}

export async function resendTicketEmail(orderId: string) {
  const response = await axiosInstance.post("/tickets/resend-mail", {
    orderId,
  });
  return response.data.data;
}

export async function getTicketHoldersPhoneNumbers(
  eventId: number,
  groupIds: number[] = [],
): Promise<string[]> {
  const response = await axiosInstance.get<ApiResponse<string[]>>(
    `/tickets/events/${eventId}/phone-numbers`,
    {
      params:
        groupIds.length > 0 ? { groupIds: groupIds.join(",") } : undefined,
    },
  );

  return response.data.data;
}
