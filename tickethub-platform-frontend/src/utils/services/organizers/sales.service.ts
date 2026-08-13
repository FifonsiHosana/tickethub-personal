import { axiosInstance } from "@/utils/api/axiosInstance";

export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

export type GetOrganizerSalesParams = PaginationParams & {
  eventId?: number;
  status?: "Completed" | "Failed";
  from?: string;
  to?: string;
  search?: string;
};

export type SaleEventBreakdown = {
  eventId: number;
  eventTitle: string;
  ticketType: string;
  ticketSummary: string;
  totalTickets: number;
  checkedInCount: number;
};

export type OrganizerSaleRow = {
  paymentId: number;
  orderId: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  phoneNumber: string;
  quantity: number;
  amount: string;
  currency: string;
  provider: "hubtel" | "paystack" | string;
  paymentStatus: "Completed" | "Failed";
  reference: string;
  purchasedAt: string | null;
  events: SaleEventBreakdown[];
};

export type GetOrganizerSalesResponse = {
  data: OrganizerSaleRow[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type GetSaleByIdResponse = {
  paymentId: number;
  orderId: number;
  paymentReference: string;
  paymentProvider: string;
  paymentStatus: "Completed" | "Failed" | string;
  amount: string;
  currency: string;
  paidAt: string | null;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  eventId: number;
  eventTitle: string;
  eventDate: string;
  ticketName: string;
  ticketIdentifier: string;
  qrCodeUrl: string | null;
  checkedIn: boolean;
  checkedInAt: string | null;
}[];

export type GetEventSalesResponse = {
  paymentId: number;
  orderId: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  ticketName: string;
  quantity: number;
  amount: string;
  paymentStatus: string;
  provider: string;
  purchasedAt: string | null;
}[];

export type GetSalesSummaryParams = {
  from?: string;
  to?: string;
  eventId?: number;
  ticketId?: number;
};

export type GetSalesSummaryResponse = {
  totalRevenue: number;
  completedOrders: number;
  ticketsSold: number;
  successfulPayments: number;
  failedPayments: number;
};

export type RevenueBreakdownItem = {
  date: string;
  revenue: string | number;
  transactions: number;
  ticketsSold?: number;
};

export type GetRevenueBreakdownResponse = RevenueBreakdownItem[];

export type GetTicketSalesBreakdownParams = GetSalesSummaryParams;

export type GetTicketSalesBreakdownResponse = {
  ticketName: string;
  sold: number;
  revenue: string | number;
}[];

// Standard API response wrapper
export type ApiResponse<T> = {
  success: boolean;
  data: T;
};


export async function getOrganizerSales(
  params?: GetOrganizerSalesParams,
): Promise<GetOrganizerSalesResponse> {
  const response = await axiosInstance.get<
    ApiResponse<GetOrganizerSalesResponse>
  >("/organizer/sales", { params });
  return response.data.data;
}

export async function getSaleById(
  orderId: number,
): Promise<GetSaleByIdResponse> {
  const response = await axiosInstance.get<ApiResponse<GetSaleByIdResponse>>(
    `/organizer/sales/${orderId}`,
  );
  return response.data.data;
}

export async function getEventSales(
  eventId: number,
): Promise<GetEventSalesResponse> {
  const response = await axiosInstance.get<ApiResponse<GetEventSalesResponse>>(
    `/organizer/sales/events/${eventId}`,
  );
  return response.data.data;
}

export async function getSalesSummary(
  params?: GetSalesSummaryParams,
): Promise<GetSalesSummaryResponse> {
  const response = await axiosInstance.get<
    ApiResponse<GetSalesSummaryResponse>
  >("/organizer/sales/summary", { params });
  return response.data.data;
}

export async function getRevenueBreakdown(
  from: string,
  to: string,
  filters?: Pick<GetSalesSummaryParams, "eventId" | "ticketId">,
): Promise<GetRevenueBreakdownResponse> {
  const response = await axiosInstance.get<
    ApiResponse<GetRevenueBreakdownResponse>
  >("/organizer/sales/revenue", { params: { from, to, ...filters } });
  return response.data.data;
}

export async function getTicketSalesBreakdown(
  params?: GetTicketSalesBreakdownParams,
): Promise<GetTicketSalesBreakdownResponse> {
  const response = await axiosInstance.get<
    ApiResponse<GetTicketSalesBreakdownResponse>
  >("/organizer/sales/tickets", { params });
  return response.data.data;
}
