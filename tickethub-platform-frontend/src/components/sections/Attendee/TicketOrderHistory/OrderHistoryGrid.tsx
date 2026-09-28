import { useState } from "react";
import { format } from "date-fns";
import { ChevronRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

export default function OrderHistoryGrid({ orders }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<OrderHistoryOrder | null>(
    null,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {orders.map((order) => {
          const firstEvent = order.events[0];
          const ticketSummaries = order.events
            .map((event) => event.ticketSummary)
            .filter(Boolean)
            .join(", ");
          const ticketTypes = order.events
            .map((event) => event.ticketType)
            .filter(Boolean)
            .join(", ");

          return (
            <Card
              key={order.orderId}
              onClick={() => setSelectedOrder(order)}
              className="cursor-pointer transition-shadow hover:shadow-md"
            >
              <CardContent className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {firstEvent?.eventTitle ?? "—"}
                    </p>
                    {firstEvent?.eventDate && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {format(
                          new Date(firstEvent.eventDate),
                          "MMM d, yyyy • h:mm a",
                        )}
                      </p>
                    )}
                    {order.events.length > 1 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        +{order.events.length - 1} more event(s)
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "border shrink-0",
                      getStatusClass(order.status),
                    )}
                  >
                    {order.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-foreground">
                    {ticketSummaries || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ticketTypes || "—"} • {order.quantity} ticket(s)
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {order.purchasedAt
                        ? format(
                            new Date(order.purchasedAt),
                            "MMM d, yyyy • h:mm a",
                          )
                        : "—"}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {order.amount !== null && order.currency !== null
                        ? `${order.currency} ${Number(order.amount).toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
