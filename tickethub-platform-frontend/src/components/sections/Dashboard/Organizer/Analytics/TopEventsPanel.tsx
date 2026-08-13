import { useMemo } from "react";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEventPerformance } from "@/hooks/organizers/useOrganizerAnalytics";
import { Loader2Icon } from "lucide-react";

export const TopEventsPanel = ({ from, to }: { from?: string; to?: string }) => {
  const { data, isLoading } = useEventPerformance({
    pageSize: 100,
    from,
    to,
  });

  const topEvents = useMemo(() => {
    if (!data) return [];
    return [...data.data]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [data]);

  const maxRevenue = topEvents[0]?.revenue ?? 0;

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm">Top Events by Revenue</CardTitle>
        {/* <CardDescription>
           Best performing events in the selected period
         </CardDescription> */}
      </CardHeader>
      <CardContent className="pt-1">
        {isLoading ? (
          <div className="h-28 flex items-center justify-center text-muted-foreground">
            <Loader2Icon className="h-5 w-5 animate-spin" />
          </div>
        ) : topEvents.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data available.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topEvents.map((event) => (
              <div key={event.eventId} className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-foreground truncate">
                    {event.eventName}
                  </p>
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                    GH₵ {event.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>
                    {event.ticketsSold} / {event.capacity} tickets ·{" "}
                    {event.occupancyRate}% occupancy
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${maxRevenue > 0 ? (event.revenue / maxRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
