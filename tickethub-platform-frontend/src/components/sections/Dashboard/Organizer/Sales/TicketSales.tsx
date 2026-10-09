import { useState } from "react";
import { useOrganizerSales } from "@/hooks/organizers/useOrganizerSales";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { SalesFilterBar } from "./SalesFilterBar";
import { SalesTable } from "./SalesTable";
import { PaginationSect } from "@/components/shared/Pagination";

type TicketSalesProps = { embedded?: boolean };

export default function TicketSales({ embedded = false }: TicketSalesProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Completed" | "Failed" | "All">("All");
  const { range } = useDashboardDateRange();

  const {
    data: sales,
    isLoading,
    isError,
  } = useOrganizerSales({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status === "All" ? undefined : status,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  return (
    <div className={`min-w-0 flex-1 space-y-6 ${embedded ? "" : "min-h-screen p-1"}`}>
      {!embedded && (
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Ticket Sales</h2>
          <p className="font-sans text-muted-foreground">
            Monitor your transactions and view customer purchase history.
          </p>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <SalesFilterBar
          search={search}
          setSearch={(val) => {
            setSearch(val);
            setPage(1);
          }}
          status={status}
          setStatus={(val) => {
            setStatus(val as "Completed" | "Failed" | "All");
            setPage(1);
          }}
        />

        <SalesTable sales={sales} isLoading={isLoading} isError={isError} />

        {sales?.pagination && sales.pagination.totalPages > 1 && (
          <PaginationSect
            page={page}
            currentPage={page}
            totalPages={sales.pagination.totalPages}
            setPage={setPage}
          />
        )}
      </div>
    </div>
  );
}


