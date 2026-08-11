import { useState } from "react";
import { useOrganizerDashboardData } from "@/hooks/organizers/useDashboardData";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BanknoteIcon,
  TicketIcon,
  ShoppingCartIcon,
  CalendarDaysIcon,
  UsersIcon,
  ScanLineIcon,
  TrendingUpIcon,
} from "lucide-react";
import OverviewTabs from "./OverviewTabs";

export default function DashboardOverview() {
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [upcomingPageSize, setUpcomingPageSize] = useState(5);
  const [topSellingPage, setTopSellingPage] = useState(1);
  const [topSellingPageSize, setTopSellingPageSize] = useState(5);
  const { range } = useDashboardDateRange();

  const { data: dashboard, isLoading } = useOrganizerDashboardData({
    upcomingPage,
    upcomingPageSize,
    topSellingPage,
    topSellingPageSize,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-3 p-1">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-28 bg-muted animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboard?.statistics;

  const metricCards = [
    {
      title: "Total Revenue",
      value: `GH₵ ${(stats?.totalRevenue ?? 0).toLocaleString()}`,
      icon: BanknoteIcon,
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
      title: "Total Orders",
      value: (stats?.totalOrders ?? 0).toLocaleString(),
      icon: ShoppingCartIcon,
    },
    {
      title: "Check-Ins",
      value: (stats?.totalCheckIns ?? 0).toLocaleString(),
      icon: ScanLineIcon,
    },
    {
      title: "Conversion Rate",
      value: `${stats?.conversionRate ?? 0}%`,
      icon: TrendingUpIcon,
    },
    {
      title: "Total Events",
      value: (stats?.totalEvents ?? 0).toLocaleString(),
      icon: CalendarDaysIcon,
    },
    {
      title: "Active Events",
      value: (stats?.publishedEvents ?? 0).toLocaleString(),
      icon: UsersIcon,
    },
  ];

  return (
    <div className="flex-1 space-y-3 p-1 min-h-screen">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
  );
}
