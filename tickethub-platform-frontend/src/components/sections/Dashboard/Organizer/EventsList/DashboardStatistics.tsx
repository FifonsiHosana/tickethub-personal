import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import {
  CalendarDaysIcon,
  TicketIcon,
  BanknoteIcon,
  ShoppingCartIcon,
} from "lucide-react";

interface DashboardStatisticsProps {
  statistics?: DashboardDataResponse["statistics"];
}

export const DashboardStatistics = ({
  statistics,
}: DashboardStatisticsProps) => {
  // Safe fallbacks in case data isn't loaded yet
  const stats = statistics || {
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    completedEvents: 0,
    totalTicketsSold: 0,
    totalOrders: 0,
    totalRevenue: 0,
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: `GH₵ ${stats.totalRevenue.toLocaleString()}`,
      icon: BanknoteIcon,
      subtext: "All time earnings",
    },
    {
      title: "Tickets Sold",
      value: stats.totalTicketsSold.toLocaleString(),
      icon: TicketIcon,
      subtext: "Across all events",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      subtext: "Completed transactions",
    },
    {
      title: "Active Events",
      value: stats.publishedEvents.toLocaleString(),
      icon: CalendarDaysIcon,
      subtext: `Out of ${stats.totalEvents} total`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1a201c]">
                {card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtext}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
