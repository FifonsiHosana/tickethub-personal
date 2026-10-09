import { axiosInstance } from "@/utils/api/axiosInstance";

export type AdminOverview = {
  totalUsers: number;
  totalOrganizers: number;
  totalAttendees: number;
  totalEvents: number;
  pendingApprovals: number;
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
};

export type TrendPoint = {
  date: string;
  revenue?: number;
  count?: number;
};

export type EventStat = {
  status: string | null;
  count: number;
};

export type OrganizerPerf = {
  organizerId: number;
  firstName: string;
  lastName: string;
  email: string;
  eventCount: number;
  totalTicketsSold: number;
};

export type CompletedOrder = {
  orderId: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  organizerName: string;
  organizerEmail: string;
  eventSummary: string;
  ticketCount: number;
  amount: number;
  feeAmount: number;
  provider: string;
  reference: string;
  currency: string;
  paidAt: string | null;
};

export type CompletedOrdersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  from?: string;
  to?: string;
};

export type PaginatedCompletedOrders = {
  data: CompletedOrder[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export async function getAdminOverview(
  from?: string,
  to?: string,
): Promise<AdminOverview> {
  const response = await axiosInstance.get("admin/analytics/overview", {
    params: { from, to },
  });
  return response.data.data;
}

export async function getRevenueTrend(
  from?: string,
  to?: string,
): Promise<TrendPoint[]> {
  const response = await axiosInstance.get("admin/analytics/revenue", {
    params: { from, to },
  });
  return response.data.data;
}

export async function getUserTrend(
  from?: string,
  to?: string,
): Promise<TrendPoint[]> {
  const response = await axiosInstance.get("admin/analytics/users", {
    params: { from, to },
  });
  return response.data.data;
}

export async function getEventStats(): Promise<{
  statusCounts: EventStat[];
  approvalCounts: EventStat[];
}> {
  const response = await axiosInstance.get("admin/analytics/events");
  return response.data.data;
}

export async function getOrganizerPerformance(): Promise<OrganizerPerf[]> {
  const response = await axiosInstance.get("admin/analytics/organizers");
  return response.data.data;
}

export async function getCompletedOrders(
  params: CompletedOrdersParams,
): Promise<PaginatedCompletedOrders> {
  const response = await axiosInstance.get("admin/analytics/completed-orders", {
    params,
  });
  return response.data.data;
}

export async function exportCompletedOrders(
  params: CompletedOrdersParams & { format: "excel" | "pdf" },
) {
  const response = await axiosInstance.get(
    "admin/analytics/completed-orders/export",
    { params, responseType: "blob" },
  );
  return response.data as Blob;
}
