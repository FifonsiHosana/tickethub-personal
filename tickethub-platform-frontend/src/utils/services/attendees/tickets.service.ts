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

export interface TicketDetailResponse {
  id: number;
  ticketIdentifier: string;
  qrCodeUrl: string;
  checkedIn: boolean;
  checkedInAt: string | null;
  ticketName: string;
  ticketType: string;
  price: string;
  eventName: string;
  eventDate: string;
  venueName: string | null;
  venueCity: string;
  venueCountry: string;
  orderStatus: string;
  purchaserFirstName: string;
  purchaserLastName: string;
  purchaserEmail: string;
}

export async function purchaseTickets(
  payload: PurchaseTicketRequest
): Promise<PurchaseTicketResponse> {
  const response = await axiosInstance.post("/tickets", payload);

  return response.data.data;
}

export async function getTicketByIdentifier(
  identifier: string
): Promise<TicketDetailResponse> {
  const response = await axiosInstance.get(`/tickets/${identifier}`);
  return response.data.data;
}