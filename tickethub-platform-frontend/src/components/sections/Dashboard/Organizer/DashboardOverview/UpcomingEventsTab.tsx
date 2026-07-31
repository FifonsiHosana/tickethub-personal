import { CalendarDaysIcon } from "lucide-react";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import { format } from "date-fns";

type Upcoming = DashboardDataResponse["upcomingEvents"];

interface Props {
  events: Upcoming;
}

export default function UpcomingEventsTab({ events }: Props) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarDaysIcon className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-muted-foreground text-sm">
          No upcoming events scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between border-b pb-2 last:border-0"
        >
          <div>
            <p className="text-sm font-medium">{event.title}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(event.dateAndTime), "MMM d, yyyy • h:mm a")} —{" "}
              {event.capacity} venue capacity
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              event.status === "Published"
                ? "bg-green-100 text-green-700"
                : event.status === "Draft"
                  ? "bg-slate-100 text-slate-700"
                  : "bg-gray-100 text-gray-700"
            }`}
          >
            {event.status}
          </span>
        </div>
      ))}
    </div>
  );
}
