import { TrendingUpIcon } from "lucide-react";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import type { DashboardPaginationMeta } from "@/utils/services/organizers/dashboard.service";
import { PaginationSect } from "@/components/shared/Pagination";

type TopEvents = DashboardDataResponse["topSellingEvents"];
type Pagination = DashboardPaginationMeta;

interface Props {
  events: TopEvents;
  pagination?: Pagination;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
}

export default function TopSellingEventsTab({
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
        <TrendingUpIcon className="h-10 w-10 text-muted-foreground mb-3" />
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
