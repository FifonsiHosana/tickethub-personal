import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { chartRange } from "@/utils/dateRanges";
import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import { RevenueChart } from "./RevenueChart";
import { TicketPerformanceChart } from "./TicketPerformance";
import { TicketSalesOverTime } from "./TicketSalesOverTime";

export default function SalesAnalytics() {
  const { range } = useDashboardDateRange();
  const { from, to } = chartRange(range);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-card min-h-screen">
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Sales Analytics
        </h2>
        <p className="text-muted-foreground font-sans">
          A comprehensive overview of your financial performance and ticket
          sales.
        </p>
      </div>

      <AnalyticsSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <RevenueChart from={from} to={to} />
        <TicketPerformanceChart from={from} to={to} />
      </div>

      <TicketSalesOverTime from={from} to={to} />
    </div>
  );
}
