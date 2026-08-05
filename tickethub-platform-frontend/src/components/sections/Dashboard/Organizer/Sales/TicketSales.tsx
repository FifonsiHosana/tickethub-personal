import { useState } from "react";
import { useOrganizerSales } from "@/hooks/organizers/useOrganizerSales";
import { SalesFilterBar } from "./SalesFilterBar";
import { SalesTable } from "./SalesTable";
import { PaginationSect } from "@/components/shared/Pagination";

export default function TicketSales() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"Completed" | "Failed" | "All">("All");

  const {
    data: sales,
    isLoading,
    isError,
  } = useOrganizerSales({
    page,
    pageSize: 10,
    search: search || undefined,
    status: status === "All" ? undefined : status,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-card min-h-screen">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Ticket Sales
        </h2>
        <p className="text-muted-foreground font-sans">
          Monitor your transactions and view customer purchase history.
        </p>
      </div>

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
        <PaginationSect page={page} currentPage={page} totalPages={sales.pagination.totalPages} setPage={setPage} />
      )}
    </div>
  );
}
