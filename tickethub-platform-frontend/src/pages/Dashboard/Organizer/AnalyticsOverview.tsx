import { useSearchParams } from "react-router";
import AnalyticsOverview from "@/components/sections/Dashboard/Organizer/Analytics/AnalyticsOverview";
import SalesAnalytics from "@/components/sections/Dashboard/Organizer/Sales/SalesAnalytics";
import TicketSales from "@/components/sections/Dashboard/Organizer/Sales/TicketSales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AnalyticsTab = "overview" | "ticket-sales" | "sales-analytics";

const tabs: { value: AnalyticsTab; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "ticket-sales", label: "Ticket Sales" },
  // { value: "sales-analytics", label: "Sales Analytics" },
];

function getTab(value: string | null): AnalyticsTab {
  return tabs.some((tab) => tab.value === value)
    ? (value as AnalyticsTab)
    : "overview";
}

export default function AnalyticsOverviewPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = getTab(searchParams.get("tab"));

  const setTab = (nextTab: string) => {
    setSearchParams(nextTab === "overview" ? {} : { tab: nextTab });
  };

  return (
    <div className="min-w-0 space-y-1">
      <Tabs value={tab} onValueChange={setTab} className="min-w-0 ">
        <div className="overflow-x-auto pb-1">
          <TabsList className="min-w-max justify-start sm:w-fit">
            {tabs.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="min-w-32 px-3"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <TabsContent value="overview" className="min-w-0">
          <AnalyticsOverview />
        </TabsContent>
        <TabsContent value="ticket-sales" className="min-w-0">
          <TicketSales embedded />
        </TabsContent>
        <TabsContent value="sales-analytics" className="min-w-0">
          <SalesAnalytics embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}
