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

export type GetUsersResponse = {
  data: User[];
  pagination: PaginationMeta;
};

export async function getUsers(
  params?: GetUsersParams,
): Promise<GetUsersResponse> {
  const response = await axiosInstance.get("admin/users", { params });
  return response.data;
}

export async function getUserById(
  userId: number,
): Promise<UserDetail> {
  const response = await axiosInstance.get(`admin/users/${userId}`);
  return response.data.data;
}

export async function suspendUser(
  userId: number,
  isActive: boolean,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/users/${userId}/suspend`,
    { isActive },
  );
  return response.data;
}

export async function verifyOrganizer(
  userId: number,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/users/${userId}/verify`,
  );
  return response.data;
}

export async function resetUserPassword(
  userId: number,
  newPassword: string,
): Promise<{ message: string }> {
  const response = await axiosInstance.patch(
    `admin/users/${userId}/reset-password`,
    { newPassword },
  );
  return response.data;
}

export async function getOrganizers(): Promise<{ data: User[] }> {
  const response = await axiosInstance.get("admin/users/organizers/list");
  return response.data;
}

export async function getVerificationQueue(): Promise<{ data: User[] }> {
  const response = await axiosInstance.get(
    "admin/users/organizers/verification-queue",
  );
  return response.data;
}
