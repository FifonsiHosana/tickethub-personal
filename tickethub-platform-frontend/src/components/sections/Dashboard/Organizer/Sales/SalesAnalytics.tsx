import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { chartRange } from "@/utils/dateRanges";
import { AnalyticsSummaryCards } from "./AnalyticsSummaryCards";
import { RevenueChart } from "./RevenueChart";
import { TicketPerformanceChart } from "./TicketPerformance";
import { TicketSalesOverTime } from "./TicketSalesOverTime";

type SalesAnalyticsProps = { embedded?: boolean };

export default function SalesAnalytics({ embedded = false }: SalesAnalyticsProps) {
  const { range } = useDashboardDateRange();
  const { from, to } = chartRange(range);

  return (
    <div className={`flex-1 space-y-6 bg-card ${embedded ? "" : "min-h-screen p-8 pt-6"}`}>
      {!embedded && (
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Sales Analytics
          </h2>
          <p className="font-sans text-muted-foreground">
            A comprehensive overview of your financial performance and ticket sales.
          </p>
        </div>
      )}

      <AnalyticsSummaryCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <RevenueChart from={from} to={to} />
        <TicketPerformanceChart from={from} to={to} />
      </div>
      <TicketSalesOverTime from={from} to={to} />
    </div>
  );
}
