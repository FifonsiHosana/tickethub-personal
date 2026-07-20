import { Loader2Icon } from "lucide-react";
import { useEventPerformance } from "@/hooks/organizers/useOrganizerAnalytics";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const EventPerformanceTable = () => {
  const { data, isLoading } = useEventPerformance();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Event Occupancy & Revenue</CardTitle>
        <CardDescription>
          Track the health and fill rate of your individual events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader className="bg-neutral-50/80">
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Tickets Sold</TableHead>
                  <TableHead className="w-50">Occupancy</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((event) => (
                  <TableRow
                    key={event.eventId}
                    className="hover:bg-neutral-50/50"
                  >
                    <TableCell className="font-medium text-[#1a201c]">
                      {event.eventName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {event.capacity.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {event.ticketsSold.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress
                          value={event.occupancyRate}
                          className="h-2 bg-neutral-100"
                        />
                        <span className="text-xs font-medium text-muted-foreground w-12">
                          {event.occupancyRate}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-[#1a201c] font-semibold">
                      GH₵ {event.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No event data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
