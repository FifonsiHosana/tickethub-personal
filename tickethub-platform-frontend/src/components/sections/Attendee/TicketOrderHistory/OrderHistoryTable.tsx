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
import { cn } from "@/lib/utils";
import type { OrderHistoryOrder } from "@/utils/services/attendees/orders.service";

interface Props {
  orders: OrderHistoryOrder[];
}

function getStatusClass(status: OrderHistoryOrder["status"]) {
  if (status === "Completed") {
    return "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  }
  return "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
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

export default function OrderHistoryTable({ orders }: Props) {
  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="border-b border-border">
            {/* <TableHead>Order</TableHead> */}
            <TableHead>Event</TableHead>
            <TableHead>Tickets</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.orderId}
              className="hover:bg-muted/50 border-b border-border"
            >
              {/* <TableCell className="font-medium text-foreground">
                #{order.orderId}
              </TableCell> */}
              <TableCell>
                <p className="text-sm font-medium text-foreground">
                  {order.eventTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.eventDate), "MMM d, yyyy • h:mm a")}
                </p>
              </TableCell>
              <TableCell>
                <p className="text-sm text-foreground">
                  {order.ticketSummary || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {order.ticketType || "—"} • {order.quantity} ticket(s)
                </p>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {order.purchasedAt
                  ? format(new Date(order.purchasedAt), "MMM d, yyyy • h:mm a")
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
                  {order.totalTickets === 0
                    ? "No tickets"
                    : `${order.checkedInCount}/${order.totalTickets} checked in`}
                </Badge>
              </TableCell>
              <TableCell className="text-sm font-medium text-foreground">
                {order.amount !== null && order.currency !== null
                  ? `${order.currency} ${Number(order.amount).toLocaleString()}`
                  : "—"}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={cn(
                    "border",
                    getStatusClass(order.status),
                  )}
                >
                  {order.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
