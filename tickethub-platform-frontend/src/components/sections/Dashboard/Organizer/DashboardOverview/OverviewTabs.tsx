import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import UpcomingEventsTab from "./UpcomingEventsTab";
import RecentOrdersTab from "./RecentOrdersTab";
import TopSellingEventsTab from "./TopSellingEventsTab";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import type { DashboardPaginationMeta } from "@/utils/services/organizers/dashboard.service";

interface Props {
  upcomingEvents: DashboardDataResponse["upcomingEvents"];
  upcomingPagination?: DashboardPaginationMeta;
  upcomingPage: number;
  setUpcomingPage: (page: number) => void;
  upcomingPageSize: number;
  setUpcomingPageSize: (size: number) => void;
  topSellingEvents: DashboardDataResponse["topSellingEvents"];
  topSellingPagination?: DashboardPaginationMeta;
  topSellingPage: number;
  setTopSellingPage: (page: number) => void;
  topSellingPageSize: number;
  setTopSellingPageSize: (size: number) => void;
}

export default function OverviewTabs({
  upcomingEvents,
  upcomingPagination,
  upcomingPage,
  setUpcomingPage,
  upcomingPageSize,
  setUpcomingPageSize,
  topSellingEvents,
  topSellingPagination,
  topSellingPage,
  setTopSellingPage,
  topSellingPageSize,
  setTopSellingPageSize,
}: Props) {
  return (
    <Card className="shadow-sm">
      <Tabs defaultValue="upcoming">
        <CardHeader className="pb-0">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="top-selling">Top Selling</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="upcoming">
            <UpcomingEventsTab
              events={upcomingEvents}
              pagination={upcomingPagination}
              page={upcomingPage}
              setPage={setUpcomingPage}
              pageSize={upcomingPageSize}
              setPageSize={setUpcomingPageSize}
            />
          </TabsContent>
          <TabsContent value="recent-orders">
            <RecentOrdersTab />
          </TabsContent>
          <TabsContent value="top-selling">
            <TopSellingEventsTab
              events={topSellingEvents}
              pagination={topSellingPagination}
              page={topSellingPage}
              setPage={setTopSellingPage}
              pageSize={topSellingPageSize}
              setPageSize={setTopSellingPageSize}
            />
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}
