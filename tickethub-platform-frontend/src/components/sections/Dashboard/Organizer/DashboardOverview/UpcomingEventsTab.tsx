import { CalendarDaysIcon } from "lucide-react";
import { format } from "date-fns";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import type { DashboardPaginationMeta } from "@/utils/services/organizers/dashboard.service";
import { PaginationSect } from "@/components/shared/Pagination";

type Upcoming = DashboardDataResponse["upcomingEvents"];
type Pagination = DashboardPaginationMeta;

interface Props {
  events: Upcoming;
  pagination?: Pagination;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export default function UpcomingEventsTab({
  events,
  pagination,
  page,
  setPage,
  pageSize,
  setPageSize,
}: Props) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarDaysIcon className="h-10 w-10 text-muted-foreground mb-3" />
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
                ? "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                : event.status === "Draft"
                  ? "bg-slate-500/15 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400"
                  : "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
            }`}
          >
            {event.status}
          </span>
        </div>
      ))}

      {pagination && (
        <PaginationSect
          page={page}
          currentPage={page}
          totalPages={pagination.totalPages}
          setPage={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
