import { useEffect, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { PaginationSect } from "@/components/shared/Pagination";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizerOrders } from "@/hooks/organizers/useOrganizerOrders";
import RecentOrdersTable from "@/components/sections/Dashboard/Organizer/DashboardOverview/RecentOrders/RecentOrdersTable";

interface Props {
  eventId: number;
}

export function EventTransactionsTab({ eventId }: Props) {
  const [status, setStatus] = useState<"Completed" | "Pending" | "all">("Completed");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { range } = useDashboardDateRange();

  useEffect(() => setPage(1), [eventId, range?.from, range?.to]);

  const { data, isError } = useOrganizerOrders({
    eventId,
    status: status === "all" ? undefined : status,
    page,
    pageSize,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
    search: search.trim() || undefined,
  });

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">Orders for this event.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_10rem] lg:w-[34rem]">
          <div className="relative min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or phone"
              className="pl-9"
            />
          </div>
          <Select value={status} onValueChange={(value) => { setStatus(value as typeof status); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="all">All statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="min-w-0 overflow-x-auto">
        {isError ? <p className="text-sm text-muted-foreground">Unable to load transactions.</p> : <RecentOrdersTable orders={data?.data ?? []} hideEventName />}
      </div>
      {data?.pagination && <PaginationSect page={page} currentPage={page} totalPages={data.pagination.totalPages} setPage={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />}
    </div>
  );
}

