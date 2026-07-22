import { useOrganizerDashboardData } from "@/hooks/organizers/useDashboardData";
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

export default function DashboardOverview() {
  const { data: dashboard, isLoading } = useOrganizerDashboardData();

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="h-8 w-48 bg-neutral-200 animate-pulse rounded" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 bg-neutral-100 animate-pulse rounded-xl" />
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
    <div className="flex-1 space-y-6 p-8 pt-6 bg-neutral-50/30 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
          Dashboard
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          Overview of your event metrics, revenue, and performance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card key={idx} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#1a201c]">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Sales */}
      {dashboard?.recentSales && dashboard.recentSales.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.recentSales.map((sale) => (
                <div
                  key={sale.orderId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">Order #{sale.orderId}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.purchasedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      sale.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Selling Events */}
      {dashboard?.topSellingEvents && dashboard.topSellingEvents.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Selling Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.topSellingEvents.map((event) => (
                <div
                  key={event.eventId}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <p className="text-sm font-medium">{event.eventTitle}</p>
                  <span className="text-sm font-semibold">
                    {event.ticketsSold} sold
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {dashboard?.upcomingEvents && dashboard.upcomingEvents.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.dateAndTime).toLocaleDateString()} —{" "}
                      {event.capacity} capacity
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      event.status === "Published"
                        ? "bg-green-100 text-green-700"
                        : event.status === "Draft"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
