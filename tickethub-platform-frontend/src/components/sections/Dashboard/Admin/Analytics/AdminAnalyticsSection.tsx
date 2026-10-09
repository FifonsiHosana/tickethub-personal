import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminAnalyticsOverview from "./AdminAnalyticsOverview";
import CompletedOrdersTab from "./CompletedOrdersTab";

export default function AdminAnalyticsSection() {
  return (
    <div className="flex-1 min-w-0 space-y-3 p-1">
      <h1 className="text-xl font-bold">Platform Analytics</h1>
      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completed-orders">Completed Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <AdminAnalyticsOverview />
        </TabsContent>
        <TabsContent value="completed-orders">
          <CompletedOrdersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
