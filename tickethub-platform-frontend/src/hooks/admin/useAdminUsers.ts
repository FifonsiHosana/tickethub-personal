import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUserById,
  suspendUser,
  verifyOrganizer,
  resetUserPassword,
  getOrganizers,
  getVerificationQueue,
} from "@/utils/services/admin/users.service";
import type { GetUsersParams } from "@/utils/services/admin/users.service";

export function useAdminUsers(params: GetUsersParams = {}) {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => getUsers(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminUserDetail(userId: number) {
  return useQuery({
    queryKey: ["admin-users", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
}

export function useAdminOrganizers() {
  return useQuery({
    queryKey: ["admin-organizers"],
    queryFn: getOrganizers,
  });
}

export function useVerificationQueue() {
  return useQuery({
    queryKey: ["admin-verification-queue"],
    queryFn: getVerificationQueue,
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, isActive }: { userId: number; isActive: boolean }) =>
      suspendUser(userId, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-organizers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-verification-queue"] });
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
    },
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: number; newPassword: string }) =>
      resetUserPassword(userId, newPassword),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
