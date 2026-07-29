import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminEvents,
  getAdminEventDetail,
  approveEvent,
  rejectEvent,
} from "@/utils/services/admin/events-admin.service";
import type { GetAdminEventsParams } from "@/utils/services/admin/events-admin.service";

export function useAdminEvents(params: GetAdminEventsParams = {}) {
  return useQuery({
    queryKey: ["admin-events", params],
    queryFn: () => getAdminEvents(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminEventDetail(eventId: number) {
  return useQuery({
    queryKey: ["admin-events", eventId],
    queryFn: () => getAdminEventDetail(eventId),
    enabled: !!eventId,
  });
}

export function useApproveEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: number) => approveEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

export function useRejectEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, reason }: { eventId: number; reason: string }) =>
      rejectEvent(eventId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}
