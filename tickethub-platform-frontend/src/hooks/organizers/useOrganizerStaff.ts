import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventStaff,
  getOrganizerStaff,
  assignEventStaff,
  generateStaffInvite,
} from "@/utils/services/organizers/staff.service";

export function useEventStaff(eventId: number | null) {
  return useQuery({
    queryKey: ["organizer-event-staff", eventId],
    queryFn: () => getEventStaff(eventId!),
    enabled: !!eventId,
  });
}

export function useOrganizerStaffList() {
  return useQuery({
    queryKey: ["organizer-staff-list"],
    queryFn: getOrganizerStaff,
  });
}

export function useAssignEventStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      staffUserIds,
    }: {
      eventId: number;
      staffUserIds: number[];
    }) => assignEventStaff(eventId, staffUserIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer-staff-list"] });
    },
  });
}

export function useGenerateStaffInvite() {
  return useMutation({
    mutationFn: (eventId: number) => generateStaffInvite(eventId),
  });
}
