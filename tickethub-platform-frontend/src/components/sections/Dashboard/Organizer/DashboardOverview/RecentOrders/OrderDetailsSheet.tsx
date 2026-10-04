import { useState } from "react";
import { format } from "date-fns";
import {
  CalendarDaysIcon,
  CreditCardIcon,
  PackageIcon,
  UserIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OrganizerOrder } from "@/utils/services/organizers/orders.service";
import { useChangeOrganizerStatus } from "@/hooks/organizers/useOrganizerStatus";
import { CompleteOrderConfirmDialog } from "./CompleteOrderConfirmDialog";

interface OrderDetailsSheetProps {
  order: OrganizerOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChanged: (orderId: number, status: OrganizerOrder["status"]) => void;
}

const orderStatusStyles: Record<string, string> = {
  Completed:
    "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20",
  Pending:
    "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20",
};

const paymentStatusStyles: Record<string, string> = {
  Completed:
    "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20",
  Failed:
    "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20",
};

const formatDate = (value: string | null) =>
  value ? format(new Date(value), "MMM d, yyyy HH:mm") : "—";

export const OrderDetailsSheet = ({
  order,
  open,
  onOpenChange,
  onStatusChanged,
}: OrderDetailsSheetProps) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutateAsync, isPending } = useChangeOrganizerStatus();

  async function completeOrder() {
    if (!order) return;

    setConfirmOpen(false);
    onStatusChanged(order.orderId, "Completed");

    try {
      await mutateAsync({ orderId: String(order.orderId) });
    } catch {
      onStatusChanged(order.orderId, "Pending");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md gap-6 overflow-y-auto"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>Order Details</SheetTitle>
          <SheetDescription>Order #{order?.orderId ?? "—"}</SheetDescription>
        </SheetHeader>

        {order && (
          <div className="flex flex-col gap-6 p-4 pt-0">
            <section className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Customer
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium text-foreground">
                  {order.customerFirstName} {order.customerLastName}
                </p>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-muted-foreground">Email</span>
                <p className="font-medium text-muted-foreground">
                  {order.customerEmail}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phone Number</span>
                <p className="font-medium text-muted-foreground">
                  {order.phoneNumber || "—"}
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <PackageIcon className="h-4 w-4 text-muted-foreground" />
                Order
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium text-foreground">
                  #{order.orderId}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={cn(orderStatusStyles[order.status])}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Placed</span>
                <span className="text-foreground">
                  {formatDate(order.purchasedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tickets</span>
                <span className="text-foreground">
                  {order.totalTickets || order.quantity}
                </span>
              </div>
            </section>

            <section className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                Payment
              </h4>
              {order.paymentStatus ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold text-foreground">
                      {order.currency || ""}{" "}
                      {Number(order.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Provider</span>
                    <span className="capitalize text-foreground">
                      {order.provider || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reference</span>
                    <span className="text-foreground truncate max-w-45">
                      {order.reference || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant="secondary"
                      className={cn(paymentStatusStyles[order.paymentStatus])}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="text-foreground">
                      {formatDate(order.paidAt)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No payment record yet for this order.
                </p>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                Event & Tickets
              </h4>
              {order.events.map((event) => (
                <div
                  key={event.eventId}
                  className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1"
                >
                  <span className="font-medium text-foreground">
                    {event.eventTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {event.ticketType}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {event.totalTickets} ticket
                    {event.totalTickets === 1 ? "" : "s"} ·{" "}
                    {event.checkedInCount}/{event.totalTickets} checked in
                  </span>
                </div>
              ))}
              {order.events.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No event details available.
                </p>
              )}
            </section>

            {order.status === "Pending" && (
              <section>
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                  Actions
                </h4>
                <div className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1">
                  <Button
                    className="shrink-0"
                    disabled={isPending}
                    onClick={() => setConfirmOpen(true)}
                  >
                    {isPending ? "Changing status" : "Change Status"}
                  </Button>
                </div>
              </section>
            )}
          </div>
        )}
      </SheetContent>
      <CompleteOrderConfirmDialog
        order={order}
        open={confirmOpen}
        isPending={isPending}
        onOpenChange={setConfirmOpen}
        onConfirm={completeOrder}
      />
    </Sheet>
  );
};