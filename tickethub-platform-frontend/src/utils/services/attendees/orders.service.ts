import { axiosInstance } from "@/utils/api/axiosInstance";

export interface OrderHistoryParams {
  page?: number;
  pageSize?: number;
}
export interface OrderFromReferenceParams {
  reference: string;
}

export type OrderHistoryEventBreakdown = {
  eventId: number;
  eventTitle: string;
  eventDate: string | null;
  ticketSummary: string;
  ticketType: string;
  totalTickets: number;
  checkedInCount: number;
};

export type OrderHistoryOrder = {
  orderId: number;
  status: "Pending" | "Completed";
  quantity: number;
  purchasedAt: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  totalTickets: number;
  checkedInCount: number;
  amount: string | null;
  currency: string | null;
  provider: string | null;
  paymentStatus: "Completed" | "Failed" | null;
  reference: string | null;
  paidAt: string | null;
  events: OrderHistoryEventBreakdown[];
};

export type OrderHistoryResponse = {
  data: OrderHistoryOrder[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// export type OrderFromReferenceResponse = {
//   success: boolean;
//   data: OrderFromReferenceOrder | null;
// };

export type OrderFromReferenceOrder = {
  orderId: number;
  status: "Pending" | "Completed";
  quantity: number;
  purchasedAt: string;

  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };

  payment: {
    amount: string;
    currency: string;
    provider: string;
  };

  tickets: OrderFromReferenceTicket[];
};

export type OrderFromReferenceTicket = {
  id: number;
  identifier: string;
  qrCodeUrl: string;
  checkedIn: boolean;
  eventTicketId: number | null;
  ticketTypeId: number | null;
  ticketTypeName: string | null;
};

export async function getOrderHistory(
  params?: OrderHistoryParams,
): Promise<OrderHistoryResponse> {
  const response = await axiosInstance.get("/attendee/orders", { params });

  return response.data.data;
}

export async function getOrderFromReference(
  reference: string,
): Promise<OrderFromReferenceOrder> {
  const response = await axiosInstance.get(`/attendee/order-from-reference`, {
    params: { reference },
  });

  return response.data.data;
}
