import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import {
  CalendarDaysIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";

interface DashboardStatisticsProps {
  statistics?: DashboardDataResponse["statistics"];
}

export const DashboardStatistics = ({
  statistics,
}: DashboardStatisticsProps) => {
  const stats = statistics || {
    totalEvents: 0,
    publishedEvents: 0,
    draftEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    totalTicketsSold: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalTicketsRemaining: 0,
    totalCheckIns: 0,
    completedOrders: 0,
    conversionRate: 0,
  };

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents.toLocaleString(),
      icon: CalendarDaysIcon,
      subtext: "All events created",
    },
    {
      title: "Published",
      value: stats.publishedEvents.toLocaleString(),
      icon: CheckCircleIcon,
      subtext: "Active & live",
    },
    {
      title: "Drafts",
      value: stats.draftEvents.toLocaleString(),
      icon: FileTextIcon,
      subtext: "Not yet published",
    },
    {
      title: "Completed",
      value: stats.completedEvents.toLocaleString(),
      icon: XCircleIcon,
      subtext: "Past events",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 mb-3">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
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
