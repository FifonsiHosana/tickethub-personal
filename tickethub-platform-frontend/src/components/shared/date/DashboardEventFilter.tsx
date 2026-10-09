import { useLocation } from "react-router";
import { ChevronRightIcon, List } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const { data } = useOrganizerEvents({ pageSize: 100 });

  if (!FILTER_PATHS.has(pathname)) return null;


  const events = data?.data ?? [];
  const selectedValue = eventId || "all";
  const selectedEvent = events.find((event) => String(event.id) === eventId);
  const selectedLabel = selectedEvent?.title ?? "All events";

  return (
    <div className="hidden min-w-0 items-center gap-1 rounded-xl p-1 sm:flex">
      <span className="shrink-0 px-2 text-sm font-medium text-muted-foreground">
        Events
      </span>

      <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />

      <Select
        value={selectedValue}
        onValueChange={(value) => {
          if (!value) return;
          setEventId(value === "all" ? "" : value);
        }}
      >
        <SelectTrigger
          className="h-8 min-w-75 gap-2 border border-input bg-background/80 px-3 shadow-xs hover:bg-background"
          aria-label="Filter by event"
        >
          <List className="h-4 w-4 shrink-0 text-muted-foreground" />

          <SelectValue placeholder="All events" className="min-w-0 truncate">
            <span className="block truncate">{selectedLabel}</span>
          </SelectValue>
        </SelectTrigger>

        <SelectContent className="max-w-[400px]">
          <SelectItem value="all">All events</SelectItem>

          {events.map((event) => (
            <SelectItem
              key={event.id}
              value={String(event.id)}
              className="max-w-[400px]"
            >
              <span className="truncate">{event.title}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

