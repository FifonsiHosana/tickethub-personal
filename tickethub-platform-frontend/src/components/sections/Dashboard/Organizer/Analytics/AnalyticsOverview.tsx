import { useEffect } from "react";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { useDashboardEventFilter } from "@/components/shared/date/useDashboardEventFilter";
import { chartRange } from "@/utils/dateRanges";
import { useAnalyticsOverviewFilters } from "./useAnalyticsOverviewFilters";
import TicketTypeFilter from "./TicketTypeFilter";
import { AnalyticsSummaryCards } from "../Sales/AnalyticsSummaryCards";
import { RevenueChart } from "../Sales/RevenueChart";
import { TicketPerformanceChart } from "../Sales/TicketPerformance";
import { TicketSalesOverTime } from "../Sales/TicketSalesOverTime";
import { DailySalesBreakdown } from "../Sales/DailySalesBreakdown";
import { TicketTypeRevenueDonut } from "../Sales/TicketTypeRevenueDonut";
import { TopEventsPanel } from "./TopEventsPanel";

export default function AnalyticsOverview() {
  const { range } = useDashboardDateRange();
  const { eventIdNumber } = useDashboardEventFilter();
  const { from, to } = chartRange(range);
  const { ticketId, setTicketId } = useAnalyticsOverviewFilters();

  useEffect(() => {
    setTicketId("");
  }, [eventIdNumber, setTicketId]);

  const ticketFilter = ticketId ? Number(ticketId) : undefined;

  return (
    <div className="flex-1 min-w-0 space-y-2 min-h-[calc(100vh-3rem)]">
      <div className="lg:hidden flex flex-col sm:flex-row gap-3">
        <TicketTypeFilter
          value={ticketId}
          onChange={setTicketId}
          eventId={eventIdNumber}
        />
      </div>

      <AnalyticsSummaryCards eventId={eventIdNumber} ticketId={ticketFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-4">
          <RevenueChart
            from={from}
            to={to}
            eventId={eventIdNumber}
            ticketId={ticketFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <TicketSalesOverTime
            from={from}
            to={to}
            eventId={eventIdNumber}
            ticketId={ticketFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <DailySalesBreakdown
            from={from}
            to={to}
            eventId={eventIdNumber}
            ticketId={ticketFilter}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4">
          <TicketPerformanceChart
            from={from}
            to={to}
            eventId={eventIdNumber}
            ticketId={ticketFilter}
          />
        </div>
        <TicketTypeRevenueDonut
          from={from}
          to={to}
          eventId={eventIdNumber}
          ticketId={ticketFilter}
        />
        <div className="lg:col-span-5">
          <TopEventsPanel from={from} to={to} eventId={eventIdNumber} />
        </div>
      </div>
    </div>
  );
}

