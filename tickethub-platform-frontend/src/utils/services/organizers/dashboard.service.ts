import { axiosInstance } from "@/utils/api/axiosInstance";

export type DashboardDataResponse = {
  statistics: {
    totalEvents: number;
    publishedEvents: number;
    draftEvents: number;
    completedEvents: number;
    totalTicketsSold: number;
    totalOrders: number;
    totalRevenue: number;
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
};

export async function getOrganizerDashboardData(): Promise<DashboardDataResponse> {
  const response = await axiosInstance.get("organizer/dashboard");

  return response.data.data;
}
