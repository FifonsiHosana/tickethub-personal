import { axiosInstance } from "@/utils/api/axiosInstance";

export type CreateTicketPayload = {
  name?: string;
  ticketTypeId?: number;
  ticketTypeName?: string;
  price: number;
  totalCount?: number;
  salesStartDate?: string;
  salesEndDate?: string;
  benefits?: string;
};

export type UpdateTicketPayload = {
  ticketTypeName?: string;
  price?: number;
  totalCount?: number;
  salesStartDate?: string;
  salesEndDate?: string;
  benefits?: string;
};

export type TicketResponse = {
  id: number;
  eventTicketId: number;
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
  eventTicketId: number;
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

export type GeneratedTicket = {
  orderId: number;
  eventTicketId: number;
  ticketIdentifier: string;
  qrCodeUrl: string;
};

export type ChangeTicketStatusPayload = {
  orderId: string;
};

export type ChangeTicketStatusResponse = {
  orderId: number;
};

export type CheckInTicketResponse = {
  status: "valid" | "already_used";
  message: string;
  ticketIdentifier: string;
  attendeeName: string;
  ticketType: string;
  checkedInAt?: string | null;
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

export async function checkInTicket(payload: {
  ticketIdentifier: string;
  eventId?: number;
}): Promise<CheckInTicketResponse> {
  const response = await axiosInstance.post<ApiResponse<CheckInTicketResponse>>(
    "/tickets/check-in",
    payload,
  );
  return response.data.data;
}

export async function resendTicketEmail(
  orderId: string,
): Promise<{ message: string }> {
  const response = await axiosInstance.post<ApiResponse<{ message: string }>>(
    "/tickets/resend-mail",
    { orderId },
  );
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

export async function changeTicketStatus(
  payload: ChangeTicketStatusPayload,
): Promise<ChangeTicketStatusResponse> {
  const response = await axiosInstance.post<
    ApiResponse<ChangeTicketStatusResponse>
  >("/tickets/status", payload);
  return response.data.data;
}

export type TicketActionResponse = {
  message: string;
};

export async function invalidateIssuedTicket(
  ticketIdentifier: string,
  reason?: string,
): Promise<TicketActionResponse> {
  const response = await axiosInstance.patch<ApiResponse<TicketActionResponse>>(
    `/organizer/tickets/items/${ticketIdentifier}/invalidate`,
    { reason },
  );
  return response.data.data;
}

export async function swapIssuedTicket(payload: {
  ticketIdentifier: string;
  targetEventTicketId: number;
  reason?: string;
}): Promise<TicketActionResponse> {
  const response = await axiosInstance.patch<ApiResponse<TicketActionResponse>>(
    `/organizer/tickets/items/${payload.ticketIdentifier}/swap`,
    {
      targetEventTicketId: payload.targetEventTicketId,
      reason: payload.reason,
    },
  );
  return response.data.data;
}
