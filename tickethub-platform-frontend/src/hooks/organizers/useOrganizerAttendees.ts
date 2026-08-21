import { useQuery } from "@tanstack/react-query";
import { getEventAttendees } from "@/utils/services/organizers/attendees.service";
import type { GetAttendeesParams } from "@/utils/services/organizers/attendees.service";

export function useEventAttendees(
  eventId: number | null,
  params?: GetAttendeesParams,
) {
  return useQuery({
    queryKey: ["organizer-event-attendees", eventId, params],
    queryFn: () => getEventAttendees(eventId!, params),
    enabled: !!eventId,
    placeholderData: (prev) => prev,
  });
}
