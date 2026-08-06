import { axiosInstance } from "@/utils/api/axiosInstance";

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type GetOrganizerOrdersParams = PaginationParams & {
  eventId?: number;
  status?: "Pending" | "Completed";
  search?: string;
};

export type OrganizerOrder = {
  orderId: number;
  status: "Pending" | "Completed";
  purchasedAt: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  phoneNumber: string;
  eventId: number;
  eventTitle: string;
  ticketType: string;
  quantity: number;
  amount: string;
  currency: string | null;
  provider: string | null;
  paymentStatus: "Completed" | "Failed" | null;
  reference: string | null;
  paidAt: string | null;
  totalTickets: number;
  checkedInCount: number;
};

export type GetOrganizerOrdersResponse = {
  data: OrganizerOrder[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

// Standard API response wrapper
export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function getOrganizerOrders(
  params?: GetOrganizerOrdersParams,
): Promise<GetOrganizerOrdersResponse> {
  const response = await axiosInstance.get<
    ApiResponse<GetOrganizerOrdersResponse>
  >("/organizer/orders", { params });
  return response.data.data;
}
