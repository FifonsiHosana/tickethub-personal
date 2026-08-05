import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GetOrganizerSalesResponse } from "@/utils/services/organizers/sales.service";
import { cn } from "@/lib/utils";

type Order = GetOrganizerSalesResponse["data"][number];

interface Props {
  orders: Order[];
}

function getCheckInClass(checkedIn: number, total: number) {
  if (total === 0) {
    return "bg-neutral-500/15 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-400";
  }
  if (checkedIn === total) {
    return "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  }
  if (checkedIn > 0) {
    return "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  }
  return "bg-slate-500/15 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400";
}

export default function RecentOrdersTable({ orders }: Props) {
  if (!orders?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-b border-border">
            <TableHead>Name</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Ticket</TableHead>
            <TableHead>Event Name</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Check-in Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const fullName =
              order.customerFirstName && order.customerLastName
                ? `${order.customerFirstName} ${order.customerLastName}`
                : order.customerFirstName || "—";
            const checkInLabel =
              order.totalTickets === 0
                ? "No tickets"
                : `${order.checkedInCount}/${order.totalTickets} checked in`;
            return (
              <TableRow
                key={order.orderId}
                className="hover:bg-muted/50 border-b border-border"
              >
                <TableCell className="font-medium flex flex-col text-foreground">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {fullName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.customerEmail}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.phoneNumber || "—"}
                </TableCell>
                {/* <TableCell className="text-sm text-foreground">
                  {order.ticketSummary || "—"}
                </TableCell> */}
                <TableCell className="text-sm text-muted-foreground">
                  {order.ticketType || "—"}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {order.eventTitle}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {order.purchasedAt
                    ? format(
                        new Date(order.purchasedAt),
                        "MMM d, yyyy • h:mm a",
                      )
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border",
                      getCheckInClass(order.checkedInCount, order.totalTickets),
                    )}
                  >
                    {checkInLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">
                  {order.currency} {Number(order.amount).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
