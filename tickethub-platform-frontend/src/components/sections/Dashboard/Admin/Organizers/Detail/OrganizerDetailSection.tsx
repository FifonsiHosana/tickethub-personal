import { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangeFilter } from "@/components/shared/date/DateRangeFilter";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import {
  useAdminOrganizerEvents,
  useAdminOrganizerOrders,
  useAdminOrganizerProfile,
  useAdminOrganizerStats,
} from "@/hooks/admin/useAdminUsers";
import { OrganizerEventsTab } from "./OrganizerEventsTab";
import { OrganizerOrdersTab } from "./OrganizerOrdersTab";
import { OrganizerProfileHeader } from "./OrganizerProfileHeader";
import { OrganizerStatsRow } from "./OrganizerStatsRow";

export function OrganizerDetailSection({ organizerId }: { organizerId: number }) {
  const { range } = useDashboardDateRange();
  const navigate = useNavigate();
  const [eventsPage, setEventsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [search, setSearch] = useState("");
  const rangeParams = { from: range?.from || undefined, to: range?.to || undefined };
  const orderParams = { ...rangeParams, page: ordersPage, pageSize: 10, search: search.trim() || undefined };
  const { data: profile, isLoading: profileLoading } = useAdminOrganizerProfile(organizerId);
  const { data: stats } = useAdminOrganizerStats(organizerId, rangeParams);
  const events = useAdminOrganizerEvents(organizerId, { ...rangeParams, page: eventsPage, pageSize: 10 });
  const orders = useAdminOrganizerOrders(organizerId, orderParams);
  const exportOrders = useAdminOrganizerOrders(organizerId, { ...orderParams, page: 1, pageSize: 10000 });

  if (profileLoading) return <div className="py-8 text-center text-muted-foreground">Loading organizer...</div>;
  if (!profile) return <div className="py-8 text-center text-muted-foreground">Organizer not found.</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button variant="ghost" className="w-fit pl-0" onClick={() => navigate("/admin/organizers")}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" /> Back to organizers
        </Button>
        <DateRangeFilter />
      </div>
      <OrganizerProfileHeader organizer={profile} />
      <OrganizerStatsRow stats={stats} />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OrganizerEventsTab data={events.data} page={eventsPage} isLoading={events.isLoading} onPageChange={setEventsPage} />
        </TabsContent>
        <TabsContent value="events">
          <OrganizerEventsTab data={events.data} page={eventsPage} isLoading={events.isLoading} onPageChange={setEventsPage} />
        </TabsContent>
        <TabsContent value="orders">
          <OrganizerOrdersTab
            data={orders.data}
            exportData={exportOrders.data}
            page={ordersPage}
            search={search}
            isLoading={orders.isLoading}
            onPageChange={setOrdersPage}
            onSearchChange={(value) => { setSearch(value); setOrdersPage(1); }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

