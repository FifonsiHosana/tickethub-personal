import { axiosInstance } from "@/utils/api/axiosInstance";

export interface OrderHistoryParams {
  page?: number;
  pageSize?: number;
}

export type OrderHistoryOrder = {
  orderId: number;
  status: "Pending" | "Completed";
  quantity: number;
  purchasedAt: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  ticketSummary: string;
  ticketType: string;
  totalTickets: number;
  checkedInCount: number;
  amount: string | null;
  currency: string | null;
  provider: string | null;
  paymentStatus: "Completed" | "Failed" | null;
  reference: string | null;
  paidAt: string | null;
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

export async function getOrderHistory(
  params?: OrderHistoryParams,
): Promise<OrderHistoryResponse> {
  const response = await axiosInstance.get("/attendee/orders", { params });

  return response.data.data;
}