import { Link } from "react-router";
import { CalendarRangeIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardEventFilter } from "@/components/shared/date/useDashboardEventFilter";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";

export default function DashboardEventFocusCard() {
  const { eventId, setEventId } = useDashboardEventFilter();
  const { data, isLoading } = useOrganizerEvents({ pageSize: 100 });
  const events = data?.data ?? [];
  const selectedEvent = events.find((event) => String(event.id) === eventId);
  const selectedLabel = selectedEvent?.title ?? "All events";

  return (
    <Card className="min-h-32 w-full max-w-full min-w-0 overflow-hidden shadow-sm">
      <CardHeader className="flex min-w-0 flex-row items-start justify-between gap-3 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium">Event focus</CardTitle>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {selectedLabel}
          </p>
        </div>
        <CalendarRangeIcon className="h-4 w-4 shrink-0 text-primary" />
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-2 sm:flex-row">
        {isLoading ? (
          <Skeleton className="h-10 flex-1 rounded-lg" />
        ) : (
          <Select
            value={eventId || "all"}
            onValueChange={(value) => {
              if (!value) return;
              setEventId(value === "all" ? "" : value);
            }}
          >
            <SelectTrigger
              className="w-full min-w-0 flex-1"
              aria-label="Filter dashboard by event"
            >
              <SelectValue placeholder="All events">
                {selectedLabel}
              </SelectValue>
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
        )}
        <Button
          size="icon-lg"
          className="shrink-0 rounded-xl"
          aria-label="Create event"
          render={
            <Link to="/organizer/events/new">
              <PlusIcon />
            </Link>
          }
        />
      </CardContent>
    </Card>
  );
}

