import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  suspendUser,
  verifyOrganizer,
  resetUserPassword,
  getOrganizers,
  getVerificationQueue,
  getAdminOrganizerProfile,
  getAdminOrganizerStats,
  getAdminOrganizerEvents,
  getAdminOrganizerOrders,
} from "@/utils/services/admin/users.service";
import type {
  AdminOrganizerParams,
  GetUsersParams,
} from "@/utils/services/admin/users.service";

export function useAdminUsers(params: GetUsersParams = {}) {
  return useQuery({ queryKey: ["admin-users", params], queryFn: () => getUsers(params), placeholderData: (prev) => prev });
}

export function useAdminUserDetail(userId: number) {
  return useQuery({ queryKey: ["admin-users", userId], queryFn: () => getUserById(userId), enabled: !!userId });
}

export function useAdminOrganizers() {
  return useQuery({ queryKey: ["admin-organizers"], queryFn: getOrganizers });
}

export function useVerificationQueue(params: GetUsersParams = {}) {
  return useQuery({ queryKey: ["admin-verification-queue", params], queryFn: () => getVerificationQueue(params), placeholderData: (prev) => prev });
}

export function useAdminOrganizerProfile(organizerId: number) {
  return useQuery({ queryKey: ["admin-organizer-detail", organizerId], queryFn: () => getAdminOrganizerProfile(organizerId), enabled: !!organizerId });
}

export function useAdminOrganizerStats(organizerId: number, params: AdminOrganizerParams = {}) {
  return useQuery({ queryKey: ["admin-organizer-stats", organizerId, params], queryFn: () => getAdminOrganizerStats(organizerId, params), enabled: !!organizerId });
}

export function useAdminOrganizerEvents(organizerId: number, params: AdminOrganizerParams = {}) {
  return useQuery({ queryKey: ["admin-organizer-events", organizerId, params], queryFn: () => getAdminOrganizerEvents(organizerId, params), enabled: !!organizerId, placeholderData: (prev) => prev });
}

export function useAdminOrganizerOrders(organizerId: number, params: AdminOrganizerParams = {}) {
  return useQuery({ queryKey: ["admin-organizer-orders", organizerId, params], queryFn: () => getAdminOrganizerOrders(organizerId, params), enabled: !!organizerId, placeholderData: (prev) => prev });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) => suspendUser(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-organizer-detail"] });
    },
  });
}

export function useVerifyOrganizer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => verifyOrganizer(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-organizer-detail"] });
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) => resetUserPassword(userId, newPassword),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
