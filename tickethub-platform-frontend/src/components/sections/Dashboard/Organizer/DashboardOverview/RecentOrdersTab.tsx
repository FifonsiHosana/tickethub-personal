import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerOrders } from "@/hooks/organizers/useOrganizerOrders";
import { PaginationSect } from "@/components/shared/Pagination";
import RecentOrdersTable from "./RecentOrdersTable";

export default function RecentOrdersTab() {
  const [eventId, setEventId] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: eventsResponse, isLoading: eventsLoading } = useOrganizerEvents({
    pageSize: 100,
  });
  const events = eventsResponse?.data ?? [];

  const { data: ordersData, isError } = useOrganizerOrders({
    eventId: eventId === "all" ? undefined : Number(eventId),
    page,
    pageSize,
  });

  const orders = ordersData?.data ?? [];
  const pagination = ordersData?.pagination;

  const selectedEventTitle =
    eventId === "all"
      ? "All Events"
      : events.find((e) => e.id === Number(eventId))?.title ?? "All Events";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recent Orders
          </h3>
          <p className="text-sm text-muted-foreground">
            Group of recent customer orders for the selected event.
          </p>
        </div>
      {eventsLoading ? (
        <Skeleton className="h-9 w-45" />
      ) : (
        <Select
          value={String(eventId)}
          onValueChange={(val) => {
            setEventId(val === "all" ? "all" : Number(val));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-45">
            <SelectValue>{selectedEventTitle}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={String(event.id)}>
                {event.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      </div>

      {isError ? (
        <p className="text-sm text-muted-foreground">
          Unable to load recent orders.
        </p>
      ) : (
        <RecentOrdersTable orders={orders} />
      )}

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
