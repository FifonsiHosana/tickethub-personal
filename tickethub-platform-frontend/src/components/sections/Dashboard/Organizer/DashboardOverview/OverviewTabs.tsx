import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import UpcomingEventsTab from "./UpcomingEventsTab";
import RecentSalesTab from "./RecentSalesTab";
import TopSellingEventsTab from "./TopSellingEventsTab";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";

interface Props {
  upcomingEvents: DashboardDataResponse["upcomingEvents"];
  recentSales: DashboardDataResponse["recentSales"];
  topSellingEvents: DashboardDataResponse["topSellingEvents"];
}

export default function OverviewTabs({
  upcomingEvents,
  recentSales,
  topSellingEvents,
}: Props) {
  return (
    <Card className="shadow-sm">
      <Tabs defaultValue="upcoming">
        <CardHeader className="pb-0">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="recent-sales">Recent Sales</TabsTrigger>
            <TabsTrigger value="top-selling">Top Selling</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="upcoming">
            <UpcomingEventsTab events={upcomingEvents} />
          </TabsContent>
          <TabsContent value="recent-sales">
            <RecentSalesTab sales={recentSales} />
          </TabsContent>
          <TabsContent value="top-selling">
            <TopSellingEventsTab events={topSellingEvents} />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
