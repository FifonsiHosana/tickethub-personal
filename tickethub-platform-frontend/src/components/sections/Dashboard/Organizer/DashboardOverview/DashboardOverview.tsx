import { useState } from "react";
import { BanknoteIcon, CreditCardIcon, ScanLineIcon, TicketIcon } from "lucide-react";
import { useOrganizerDashboardData } from "@/hooks/organizers/useDashboardData";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { useDashboardEventFilter } from "@/components/shared/date/useDashboardEventFilter";
import OverviewTabs from "./OverviewTabs";
import DashboardActionCard from "./DashboardActionCard";
import DashboardMetricCard from "./DashboardMetricCard";

export default function DashboardOverview() {
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingPageSize, setUpcomingPageSize] = useState(5);
  const [topSellingPage, setTopSellingPage] = useState(1);
  const [topSellingPageSize, setTopSellingPageSize] = useState(5);
  const { range } = useDashboardDateRange();
  const { eventIdNumber } = useDashboardEventFilter();

  const { data: dashboard, isLoading } = useOrganizerDashboardData({
    upcomingPage,
    upcomingPageSize,
    topSellingPage,
    topSellingPageSize,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
    eventId: eventIdNumber,
  });

  if (isLoading) return <DashboardSkeleton />;

  const stats = dashboard?.statistics;
  const metricCards = [
    {
      title: "Revenue",
      value: `GH₵ ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: BanknoteIcon,
    },
    {
      title: "Tickets Available",
      value: (stats?.totalTicketsAvailable ?? 0).toLocaleString(),
      icon: TicketIcon,
    },
    {
      title: "Tickets Sold",
      value: (stats?.totalTicketsSold ?? 0).toLocaleString(),
      icon: TicketIcon,
    },
    {
      title: "Tickets Remaining",
      value: (stats?.totalTicketsRemaining ?? 0).toLocaleString(),
      icon: TicketIcon,
    },
    {
      title: "Orders",
      value: (stats?.totalOrders ?? 0).toLocaleString(),
      icon: CreditCardIcon,
    },
  ];

  return (
    <div className="min-h-screen max-w-full min-w-0 space-y-4 overflow-x-hidden p-1">
      <div className="grid min-w-0 grid-cols-2 gap-1 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardActionCard
          title="Scan"
          count={`${(stats?.totalCheckIns ?? 0).toLocaleString()} check-ins`}
          href="/organizer/scan?openScanner=1"
          icon={ScanLineIcon}
        />
        {metricCards.map((card) => (
          <DashboardMetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="pt-3">
        <OverviewTabs
          upcomingEvents={dashboard?.upcomingEvents ?? []}
          upcomingPagination={dashboard?.upcomingPagination}
          upcomingPage={upcomingPage}
          setUpcomingPage={setUpcomingPage}
          upcomingPageSize={upcomingPageSize}
          setUpcomingPageSize={setUpcomingPageSize}
          topSellingEvents={dashboard?.topSellingEvents ?? []}
          topSellingPagination={dashboard?.topSellingPagination}
          topSellingPage={topSellingPage}
          setTopSellingPage={setTopSellingPage}
          topSellingPageSize={topSellingPageSize}
          setTopSellingPageSize={setTopSellingPageSize}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-4 p-1">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}