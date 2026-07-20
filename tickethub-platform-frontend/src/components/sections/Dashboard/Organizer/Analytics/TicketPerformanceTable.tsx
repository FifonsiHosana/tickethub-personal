import { Loader2Icon } from "lucide-react";
import { useTicketPerformance } from "@/hooks/organizers/useOrganizerAnalytics";
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

export const TicketPerformanceTable = () => {
  const { data, isLoading } = useTicketPerformance();

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Ticket Tier Analytics</CardTitle>
        <CardDescription>
          Breakdown of sales volume and revenue by ticket type
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
                  <TableHead>Ticket Name</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead className="text-right">Ticket Orders</TableHead>
                  <TableHead className="text-right">
                    Generated Revenue
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.map((ticket) => (
                  <TableRow
                    key={ticket.ticketId}
                    className="hover:bg-neutral-50/50"
                  >
                    <TableCell className="font-medium text-[#1a201c]">
                      {ticket.ticketName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {ticket.eventName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {ticket.ticketsSold.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-[#1a201c] font-semibold">
                      GH₵ {ticket.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.length && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No ticket data available.
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
