import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { chartRange } from "@/utils/dateRanges";
import { useAnalyticsOverviewFilters } from "./useAnalyticsOverviewFilters";
import EventSelectDropdown from "../Shared/EventSelectDropdown";
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
  const { from, to } = chartRange(range);

  const { eventId, ticketId, setEventId, setTicketId } =
    useAnalyticsOverviewFilters();

  const eventFilter = eventId ? Number(eventId) : undefined;
  const ticketFilter = ticketId ? Number(ticketId) : undefined;

  return (
    <div className="flex-1 min-w-0 space-y-2 min-h-[calc(100vh-3rem)]">
      <div className="lg:hidden flex flex-col sm:flex-row gap-3">
        <EventSelectDropdown value={eventId} onChange={setEventId} />
        <TicketTypeFilter
          value={ticketId}
          onChange={setTicketId}
          eventId={eventFilter}
        />
      </div>

      <AnalyticsSummaryCards eventId={eventFilter} ticketId={ticketFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        <div className="lg:col-span-4">
          <RevenueChart
            from={from}
            to={to}
            eventId={eventFilter}
            ticketId={ticketFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <TicketSalesOverTime
            from={from}
            to={to}
            eventId={eventFilter}
            ticketId={ticketFilter}
          />
        </div>
        <div className="lg:col-span-4">
          <DailySalesBreakdown
            from={from}
            to={to}
            eventId={eventFilter}
            ticketId={ticketFilter}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4">
          <TicketPerformanceChart
            from={from}
            to={to}
            eventId={eventFilter}
            ticketId={ticketFilter}
          />
        </div>
        <TicketTypeRevenueDonut
          from={from}
          to={to}
          eventId={eventFilter}
          ticketId={ticketFilter}
        />
        <div className="lg:col-span-5">
          <TopEventsPanel from={from} to={to} />
        </div>
      </div>
    </div>
  );
}