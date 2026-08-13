import { useState } from "react";
import { format } from "date-fns";
import { ChevronRightIcon } from "lucide-react";
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
import { OrderDetailsSheet } from "./OrderDetailsSheet";

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
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryOrder | null>(
    null,
  );

  return (
    <>
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
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const eventLines = order.events.map((event) => ({
                eventId: event.eventId,
                title: event.eventTitle,
                date: event.eventDate,
              }));
              const ticketSummaries = order.events
                .map((event) => event.ticketSummary)
                .filter(Boolean)
                .join(", ");
              const ticketTypes = order.events
                .map((event) => event.ticketType)
                .filter(Boolean)
                .join(", ");

              return (
                <TableRow
                  key={order.orderId}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-muted/50 border-b border-border cursor-pointer"
                >
                  <TableCell>
                    {eventLines.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {/* {eventLines.map((event) => (
                          <div key={event.eventId}>
                            <p className="text-sm font-medium text-foreground">
                              {event.title}
                            </p>
                            {event.date && (
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(event.date),
                                  "MMM d, yyyy • h:mm a",
                                )}
                              </p>
                            )}
                          </div>
                        ))} */}
                        {
                          <div key={eventLines[0].eventId}>
                            <p className="text-sm font-medium text-foreground">
                              {eventLines[0].title}
                            </p>
                            {eventLines[0].date && (
                              <p className="text-xs text-muted-foreground">
                                {format(
                                  new Date(eventLines[0].date),
                                  "MMM d, yyyy • h:mm a",
                                )}
                              </p>
                            )}
                          </div>
                        }
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">
                      {ticketSummaries || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticketTypes || "—"} • {order.quantity} ticket(s)
                    </p>
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
                        getCheckInClass(
                          order.checkedInCount,
                          order.totalTickets,
                        ),
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
                      className={cn("border", getStatusClass(order.status))}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <OrderDetailsSheet
        order={selectedOrder}
        open={selectedOrder !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedOrder(null);
        }}
      />
    </>
  );
}
