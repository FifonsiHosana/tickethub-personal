import { useAdminOverview, useEventStats, useOrganizerPerformance } from "@/hooks/admin/useAdminAnalytics";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BanknoteIcon, CalendarIcon, PercentIcon, UsersIcon } from "lucide-react";

export default function AdminAnalyticsSection() {
  const { range } = useDashboardDateRange();
  const { data: overview, isLoading: ovLoading } = useAdminOverview(
    range?.from ?? undefined,
    range?.to ?? undefined,
  );
  const { data: stats, isLoading: stLoading } = useEventStats();
  const { data: perf, isLoading: perfLoading } = useOrganizerPerformance();

  if (ovLoading) return <div className="h-32 bg-muted animate-pulse rounded-xl" />;

  const summaryCards = [
    { title: "Total Revenue", value: `GH₵ ${(overview?.totalRevenue ?? 0).toLocaleString()}`, icon: BanknoteIcon },
    { title: "Commission Earned", value: `GH₵ ${(overview?.totalCommission ?? 0).toLocaleString()}`, icon: PercentIcon },
    { title: "Total Events", value: (overview?.totalEvents ?? 0).toLocaleString(), icon: CalendarIcon },
    { title: "Total Users", value: (overview?.totalUsers ?? 0).toLocaleString(), icon: UsersIcon },
  ];

  return (
    <div className="space-y-3 p-1">
      <h1 className="text-xl font-bold">Platform Analytics</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-3"><div className="text-lg font-bold">{card.value}</div></CardContent>
            </Card>
          );
        })}
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm font-medium">Events by Status</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            {stLoading ? <div className="h-16 bg-muted animate-pulse rounded" /> : (
              <div className="space-y-1">
                {stats?.statusCounts.map((s) => (
                  <div key={s.status} className="flex justify-between text-sm"><span>{s.status}</span><span className="font-medium">{s.count}</span></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm font-medium">Events by Approval</CardTitle></CardHeader>
          <CardContent className="px-4 pb-3">
            {stLoading ? <div className="h-16 bg-muted animate-pulse rounded" /> : (
              <div className="space-y-1">
                {stats?.approvalCounts.map((s) => (
                  <div key={s.status} className="flex justify-between text-sm"><span><Badge variant={s.status === "Approved" ? "default" : s.status === "Pending" ? "secondary" : "destructive"}>{s.status}</Badge></span><span className="font-medium">{s.count}</span></div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="shadow-sm">
        <CardHeader className="pb-2 pt-3 px-4"><CardTitle className="text-sm font-medium">Top Organizers</CardTitle></CardHeader>
        <CardContent className="px-4 pb-3">
          {perfLoading ? <div className="h-20 bg-muted animate-pulse rounded" /> : (
            <div className="rounded-md border border-border max-h-70 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Organizer</TableHead><TableHead>Events</TableHead><TableHead>Tickets Sold</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {perf?.length === 0 ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">No data</TableCell></TableRow>
                  ) : (
                    perf?.slice(0, 10).map((o) => (
                      <TableRow key={o.organizerId}>
                        <TableCell className="font-medium">{o.firstName} {o.lastName}</TableCell>
                        <TableCell>{o.eventCount}</TableCell>
                        <TableCell>{o.totalTicketsSold.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
