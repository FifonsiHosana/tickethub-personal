import { axiosInstance } from "@/utils/api/axiosInstance";

export interface PurchaseTicketRequest {
  items: {
    eventTicketId: number;
    quantity: number;
  }[];

  attendee: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export interface PurchaseTicketResponse {
  orderId: number;
  quantity: number;

  tickets: {
    orderId: number;
    eventTicketId: number;
    ticketIdentifier: string;
    qrCodeUrl: string;
  }[];
}

export async function purchaseTickets(
  payload: PurchaseTicketRequest
): Promise<PurchaseTicketResponse> {
  const response = await axiosInstance.post("/tickets", payload);

  return response.data.data;
}
