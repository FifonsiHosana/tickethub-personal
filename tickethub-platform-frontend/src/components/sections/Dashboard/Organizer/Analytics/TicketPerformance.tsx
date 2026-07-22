import { useState } from "react";
import { TicketIcon } from "lucide-react";
import { useOverviewAnalytics, useTicketPerformance } from "@/hooks/organizers/useOrganizerAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketPerformanceTable } from "./TicketPerformanceTable";

export default function TicketPerformance() {
  const { data: overview } = useOverviewAnalytics();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useTicketPerformance({
    page,
    pageSize: 10,
    search: search || undefined,
  });

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-neutral-50/30 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
          Ticket Performance
        </h2>
        <p className="text-muted-foreground font-sans">
          Analyze which ticket tiers are driving the most value.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="shadow-sm md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Ticket Orders Made
            </CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#1a201c]">
              {overview?.ticketsSold?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all active events
            </p>
          </CardContent>
        </Card>
      </div>

      <TicketPerformanceTable
        data={response?.data}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        onPageChange={setPage}
        pagination={response?.pagination}
      />
    </div>
  );
}
