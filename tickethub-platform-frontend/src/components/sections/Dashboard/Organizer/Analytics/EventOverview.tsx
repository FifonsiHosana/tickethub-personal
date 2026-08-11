import { useState } from "react";
import { CalendarDaysIcon, ShoppingCart, TicketIcon } from "lucide-react";
import {
  useOverviewAnalytics,
  useEventPerformance,
} from "@/hooks/organizers/useOrganizerAnalytics";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventPerformanceTable } from "./EventPerformanceTable";

export default function EventOverview() {
  const { range } = useDashboardDateRange();
  const { data: overview } = useOverviewAnalytics(
    range?.from ?? undefined,
    range?.to ?? undefined,
  );
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useEventPerformance({
    page,
    pageSize: 10,
    search: search || undefined,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  return (
    <div className="flex-1 space-y-6 p-1 bg-card min-h-screen">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="shadow-sm md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Events Created
            </CardTitle>
            <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {overview?.totalEvents?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime platform events
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tickets Sold
            </CardTitle>
            <TicketIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {overview?.ticketsSold?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime ticket order sales
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Order Attempts
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-foreground">
              {overview?.totalOrders?.toLocaleString() ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime attempted orders
            </p>
          </CardContent>
        </Card>
      </div>

      <EventPerformanceTable
        data={response?.data}
        isLoading={isLoading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        page={page}
        onPageChange={setPage}
        pagination={response?.pagination}
      />
    </div>
  );
}
