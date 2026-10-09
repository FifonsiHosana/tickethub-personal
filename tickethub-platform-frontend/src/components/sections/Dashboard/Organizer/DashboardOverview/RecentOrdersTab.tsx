import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useOrganizerOrders } from "@/hooks/organizers/useOrganizerOrders";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { useDashboardEventFilter } from "@/components/shared/date/useDashboardEventFilter";
import { PaginationSect } from "@/components/shared/Pagination";
import RecentOrdersTable from "./RecentOrders/RecentOrdersTable";

export default function RecentOrdersTab() {
  const [status, setStatus] = useState<"Completed" | "Pending" | "all">("Completed");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { range } = useDashboardDateRange();
  const { eventIdNumber } = useDashboardEventFilter();

  useEffect(() => {
    setPage(1);
  }, [eventIdNumber]);

  const { data: ordersData, isError } = useOrganizerOrders({
    eventId: eventIdNumber,
    status: status === "all" ? undefined : status,
    page,
    pageSize,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
    search: search.trim() || undefined,
  });

  const orders = ordersData?.data ?? [];
  const pagination = ordersData?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Recent Orders
          </h3>
          <p className="text-sm text-muted-foreground">
            Group of recent customer orders for the selected filters.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, phone, or ticket ID"
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(val) => {
              if (!val) return;
              setStatus(val as "Completed" | "Pending" | "all");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isError ? (
        <p className="text-sm text-muted-foreground">
          Unable to load recent orders.
        </p>
      ) : (
        <RecentOrdersTable orders={orders} hideEventName={!!eventIdNumber} />
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


