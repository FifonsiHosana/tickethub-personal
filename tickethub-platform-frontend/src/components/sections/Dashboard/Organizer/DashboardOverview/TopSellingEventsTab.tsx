import { TrendingUpIcon } from "lucide-react";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";

type TopEvents = DashboardDataResponse["topSellingEvents"];

interface Props {
  events: TopEvents;
}

export default function TopSellingEventsTab({ events }: Props) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUpIcon className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-muted-foreground text-sm">
          No top selling events yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.eventId}
          className="flex items-center justify-between border-b pb-2 last:border-0"
        >
          <p className="text-sm font-medium">{event.eventTitle}</p>
          <span className="text-sm font-semibold text-primary">
            {event.ticketsSold} sold
          </span>
        </div>
      ))}
    </div>
  );
}
