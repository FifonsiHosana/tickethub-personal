import { axiosInstance } from "@/utils/api/axiosInstance";

export type DashboardPaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type DashboardDataResponse = {
  statistics: {
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    totalTicketsSold: number;
    totalTicketsRemaining: number;
    totalCheckIns: number;
    totalRevenue: number;
    totalOrders: number;
    completedOrders: number;
    conversionRate: number;
  };
  upcomingEvents: {
    id: number;
    title: string;
    description: string | null;
    status: "Cancelled" | "Completed" | "Draft" | "Published";
    eventVenueId: number | null;
    organizerId: number | null;
    dateAndTime: string;
    capacity: number;
    approvedBy: number | null;
    approvedAt: string | null;
    approvalStatus: "Approved" | "Pending" | "Rejected" | null;
    termsAndConditions: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  upcomingPagination: DashboardPaginationMeta;
  recentSales: {
    orderId: number;
    customerId: number | null;
    status: "Completed" | "Pending";
    purchasedAt: string;
  }[];
  topSellingEvents: {
    eventId: number;
    eventTitle: string;
    ticketsSold: number;
  }[];
  topSellingPagination: DashboardPaginationMeta;
};

export interface DashboardParams {
  upcomingPage?: number;
  upcomingPageSize?: number;
  topSellingPage?: number;
  topSellingPageSize?: number;
  from?: string;
  to?: string;
}

export async function getOrganizerDashboardData(
  params?: DashboardParams,
): Promise<DashboardDataResponse> {
  const response = await axiosInstance.get("organizer/dashboard", {
    params,
  });

  return response.data.data;
}

