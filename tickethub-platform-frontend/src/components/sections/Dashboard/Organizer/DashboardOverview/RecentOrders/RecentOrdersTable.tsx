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
import type { OrganizerOrder } from "@/utils/services/organizers/orders.service";
import { cn } from "@/lib/utils";
import { TruncatedCell } from "./TruncatedCell";
import { OrderDetailsSheet } from "./OrderDetailsSheet";

type Order = OrganizerOrder;

interface Props {
  orders: Order[];
}

function getOrderStatusClass(status: Order["status"]) {
  if (status === "Completed") {
    return "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  }
  return "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
}

export default function RecentOrdersTable({ orders }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (!orders?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No orders found.
      </div>
    );
  }

  return (
    <>
      <div className="w-full min-w-0 rounded-xl border border-border overflow-x-auto bg-card">
        <Table className="min-w-225">
          <TableHeader className="bg-muted/50">
            <TableRow className="border-b border-border">
              <TableHead className="w-50">Name</TableHead>
              <TableHead className="w-32.5">Phone Number</TableHead>
              <TableHead className="w-30">Ticket</TableHead>
              <TableHead className="w-45">Event Name</TableHead>
              <TableHead className="w-40">Purchase Date</TableHead>
              <TableHead className="w-30">Order Status</TableHead>
              <TableHead className="w-30">Amount</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const fullName =
                order.customerFirstName && order.customerLastName
                  ? `${order.customerFirstName} ${order.customerLastName}`
                  : order.customerFirstName || "—";
              const ticketTypes = order.events
                .map((e) => e.ticketType)
                .join(", ");
              const eventTitles = order.events
                .map((e) => e.eventTitle)
                .join(", ");
              return (
                <TableRow
                  key={order.orderId}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-muted/50 border-b border-border cursor-pointer"
                >
                  <TableCell className="font-medium text-foreground max-w-50">
                    <div className="flex flex-col min-w-0">
                      <TruncatedCell
                        value={fullName}
                        className="font-medium text-foreground"
                      />
                      <TruncatedCell
                        value={order.customerEmail}
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-32.5">
                    {order.phoneNumber || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-30">
                    <TruncatedCell value={ticketTypes || "—"} />
                  </TableCell>
                  <TableCell className="text-sm text-foreground max-w-45">
                    <TruncatedCell value={eventTitles} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
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
                        "border whitespace-nowrap",
                        getOrderStatusClass(order.status),
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-foreground whitespace-nowrap">
                    {order.currency
                      ? `${order.currency} ${Number(order.amount).toLocaleString()}`
                      : `GHS ${Number(order.amount).toLocaleString()}`}
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