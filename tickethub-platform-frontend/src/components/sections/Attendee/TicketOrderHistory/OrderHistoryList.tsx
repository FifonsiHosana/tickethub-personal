import { Link } from "react-router";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderHistoryOrder } from "@/utils/services/attendees/orders.service";
import { eventSummary, formatOrderDate, ticketCountLabel } from "./orderHistoryUtils";

interface Props {
  orders: OrderHistoryOrder[];
  selectedOrderId?: number;
}

export default function OrderHistoryList({ orders, selectedOrderId }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {orders.map((order, index) => (
        <Link
          key={order.orderId}
          to={`/ticket-order-history/${order.orderId}`}
          className={cn(
            "flex min-h-24 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/60",
            index > 0 && "border-t border-border",
            selectedOrderId === order.orderId && "bg-primary/10 hover:bg-primary/10",
          )}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">Order #{order.orderId}</p>
              <span className="text-xs text-muted-foreground">{ticketCountLabel(order.totalTickets)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatOrderDate(order.paidAt ?? order.purchasedAt)}
            </p>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {eventSummary(order)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
            <span>View</span>
            <ChevronRightIcon className="h-4 w-4" />
          </div>
        </Link>
      ))}
    </div>
  );
}
