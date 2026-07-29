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

export async function getAdminOverview(): Promise<AdminOverview> {
  const response = await axiosInstance.get("admin/analytics/overview");
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
