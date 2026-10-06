import { useLocation } from "react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";
import { useDashboardEventFilter } from "./useDashboardEventFilter";

const FILTER_PATHS = new Set([
  "/organizer/dashboard",
  "/organizer/orders",
  "/organizer/sms",
  "/organizer/analytics",
  "/organizer/scan",
]);

export function DashboardEventFilter() {
  const { pathname } = useLocation();
  const { eventId, setEventId } = useDashboardEventFilter();
  const { data, isLoading } = useOrganizerEvents({ pageSize: 100 });

  if (!FILTER_PATHS.has(pathname)) return null;

  if (isLoading) {
    return <Skeleton className="h-9 w-36 sm:w-44" />;
  }

  const events = data?.data ?? [];
  const selectedValue = eventId || "all";

  return (
    <Select
      value={selectedValue}
      onValueChange={(value) => {
        if (!value) return;
        setEventId(value === "all" ? "" : value);
      }}
    >
      <SelectTrigger
        className="w-36 sm:w-44 lg:w-56"
        aria-label="Filter dashboard by event"
      >
        <SelectValue placeholder="All events" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All events</SelectItem>
        {events.map((event) => (
          <SelectItem key={event.id} value={String(event.id)}>
            {event.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}


