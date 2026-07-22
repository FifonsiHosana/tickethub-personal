import { axiosInstance } from "@/utils/api/axiosInstance";
import type { PaginationMeta } from "./events.service";

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

export type EventPerformanceItem = {
  eventId: number;
  eventName: string;
  capacity: number;
  ticketsSold: number;
  revenue: number;
  occupancyRate: number;
};

export type TicketPerformanceItem = {
  ticketId: number;
  ticketName: string;
  eventName: string;
  ticketsSold: number;
  revenue: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type EventPerformanceResponse = EventPerformanceItem[];
export type TicketPerformanceResponse = TicketPerformanceItem[];

export type AnalyticsSearchParams = {
  page?: number;
  pageSize?: number;
  search?: string;
};

// Standard API Response Wrapper
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
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

export async function getEventPerformance(
  params?: AnalyticsSearchParams,
): Promise<PaginatedResponse<EventPerformanceItem>> {
  const response = await axiosInstance.get<
    ApiResponse<EventPerformanceItem[]>
  >("/organizer/analytics/events", { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  };
}

export async function getTicketPerformance(
  params?: AnalyticsSearchParams,
): Promise<PaginatedResponse<TicketPerformanceItem>> {
  const response = await axiosInstance.get<
    ApiResponse<TicketPerformanceItem[]>
  >("/organizer/analytics/tickets", { params });
  return {
    data: response.data.data,
    pagination: response.data.pagination ?? { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  };
}
