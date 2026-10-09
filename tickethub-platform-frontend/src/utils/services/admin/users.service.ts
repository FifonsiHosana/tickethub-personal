import { axiosInstance } from "@/utils/api/axiosInstance";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  roleName: string;
};

export type UserDetail = User & {
  profileImage: string | null;
  updatedAt: string;
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type GetUsersParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  isActive?: string;
  isVerified?: string;
};

export type AdminOrganizerParams = {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  search?: string;
};

export type AdminOrganizerStats = {
  totalOrders: number;
  totalAmount: number;
  totalFeeAmount: number;
  totalTicketsSold: number;
  totalEvents: number;
  publishedEvents: number;
  averageOrderValue: number;
};

export type AdminOrganizerEvent = {
  id: number;
  slug: string | null;
  title: string;
  status: string;
  approvalStatus: string;
  dateAndTime: string;
  capacity: number;
  createdAt: string;
  ticketsSold: number;
  grossSales: string | number;
};

export type AdminOrganizerOrder = {
  orderId: number;
  status: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  phoneNumber: string | null;
  quantity: number;
  amount: string | number | null;
  feeAmount: string | number | null;
  subtotal: string | number | null;
  currency: string | null;
  provider: string | null;
  paymentStatus: string | null;
  reference: string | null;
  paidAt: string | null;
  purchasedAt: string;
  events: string | null;
  ticketTypes: string | null;
  totalTickets: number;
};

export type GetUsersResponse = {
  data: User[];
  pagination: PaginationMeta;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export async function getUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
  const response = await axiosInstance.get("admin/users", { params });
  return response.data;
}

export async function getUserById(userId: number): Promise<UserDetail> {
  const response = await axiosInstance.get(`admin/users/${userId}`);
  return response.data.data;
}

export async function suspendUser(userId: number, isActive: boolean): Promise<{ message: string }> {
  const response = await axiosInstance.patch(`admin/users/${userId}/suspend`, { isActive });
  return response.data;
}

export async function verifyOrganizer(userId: number): Promise<{ message: string }> {
  const response = await axiosInstance.patch(`admin/users/${userId}/verify`);
  return response.data;
}

export async function resetUserPassword(userId: number, newPassword: string): Promise<{ message: string }> {
  const response = await axiosInstance.patch(`admin/users/${userId}/reset-password`, { newPassword });
  return response.data;
}

export async function getOrganizers(): Promise<{ data: User[] }> {
  const response = await axiosInstance.get("admin/users/organizers/list");
  return response.data;
}

export async function getVerificationQueue(params?: GetUsersParams): Promise<GetUsersResponse> {
  const response = await axiosInstance.get("admin/users/organizers/verification-queue", { params });
  return response.data;
}

export async function getAdminOrganizerProfile(organizerId: number): Promise<UserDetail> {
  const response = await axiosInstance.get(`admin/users/organizers/${organizerId}/detail`);
  return response.data.data;
}

export async function getAdminOrganizerStats(
  organizerId: number,
  params?: AdminOrganizerParams,
): Promise<AdminOrganizerStats> {
  const response = await axiosInstance.get(`admin/users/organizers/${organizerId}/stats`, { params });
  return response.data.data;
}

export async function getAdminOrganizerEvents(
  organizerId: number,
  params?: AdminOrganizerParams,
): Promise<PaginatedResponse<AdminOrganizerEvent>> {
  const response = await axiosInstance.get(`admin/users/organizers/${organizerId}/events`, { params });
  return response.data;
}

export async function getAdminOrganizerOrders(
  organizerId: number,
  params?: AdminOrganizerParams,
): Promise<PaginatedResponse<AdminOrganizerOrder>> {
  const response = await axiosInstance.get(`admin/users/organizers/${organizerId}/orders`, { params });
  return response.data;
}
