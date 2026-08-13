import { BanknoteIcon, TrendingUpIcon } from "lucide-react";
import { useOverviewAnalytics } from "@/hooks/organizers/useOrganizerAnalytics";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { chartRange } from "@/utils/dateRanges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueChart } from "./RevenueChart";

export default function RevenueAndPayouts() {
  const { range } = useDashboardDateRange();
  const { data: overview } = useOverviewAnalytics(
    range?.from ?? undefined,
    range?.to ?? undefined,
  );
  const { from, to } = chartRange(range);

  return (
    <div className="flex-1 min-w-0 space-y-6 p-1 min-h-screen">
      <div className="mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Revenue & Payouts
        </h2>
        <p className="text-muted-foreground font-sans">
          Track your earnings and historical transaction volume.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <BanknoteIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              GH₵ {overview?.totalRevenue?.toLocaleString() ?? "0.00"}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {overview?.totalOrders?.toLocaleString() ?? "0"}
            </div>
          </CardContent>
        </Card>
      </div>

      <RevenueChart from={from} to={to} />
    </div>
  );
}
