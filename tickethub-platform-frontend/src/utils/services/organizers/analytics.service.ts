import { axiosInstance } from "@/utils/api/axiosInstance";

export type AnalyticsOverviewResponse = {
  totalRevenue: number;
  totalOrders: number;
  ticketsSold: number;
  totalEvents: number;
};

export type RevenueTrendParams = {
  from?: string;
  to?: string;
};

export type RevenueTrendResponse = {
  date: string;
  revenue: number | string;
  transactions: number;
}[];

export type EventPerformanceResponse = {
  eventId: number;
  eventName: string;
  capacity: number;
  ticketsSold: number;
  revenue: number;
  occupancyRate: number;
}[];

export type TicketPerformanceResponse = {
  ticketId: number;
  ticketName: string;
  eventName: string;
  ticketsSold: number;
  revenue: number;
}[];

// Standard API Response Wrapper
export type ApiResponse<T> = {
  success: boolean;
  data: T;
};

export async function getOverviewAnalytics(): Promise<AnalyticsOverviewResponse> {
  const response = await axiosInstance.get<
    ApiResponse<AnalyticsOverviewResponse>
  >("/organizer/analytics/overview");
  return response.data.data;
}

export async function getRevenueTrend(
  params: RevenueTrendParams,
): Promise<RevenueTrendResponse> {
  const response = await axiosInstance.get<ApiResponse<RevenueTrendResponse>>(
    "/organizer/analytics/revenue-trend",
    { params },
  );
  return response.data.data;
}

export async function getEventPerformance(): Promise<EventPerformanceResponse> {
  const response = await axiosInstance.get<
    ApiResponse<EventPerformanceResponse>
  >("/organizer/analytics/events");
  return response.data.data;
}

export async function getTicketPerformance(): Promise<TicketPerformanceResponse> {
  const response = await axiosInstance.get<
    ApiResponse<TicketPerformanceResponse>
  >("/organizer/analytics/tickets");
  return response.data.data;
}
