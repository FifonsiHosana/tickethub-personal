import { format } from "date-fns";
import { CalendarDaysIcon, CreditCardIcon, UserIcon } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { type OrganizerSaleRow } from "@/utils/services/organizers/sales.service";

interface SaleDetailsSheetProps {
  sale: OrganizerSaleRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const paymentStatusStyles: Record<
  string,
  { label: string; className: string }
> = {
  Completed: {
    label: "Completed",
    className:
      "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20",
  },
  Failed: {
    label: "Failed",
    className:
      "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20",
  },
};

const formatDate = (value: string | null) =>
  value ? format(new Date(value), "MMM d, yyyy HH:mm") : "N/A";

export const SaleDetailsSheet = ({
  sale,
  open,
  onOpenChange,
}: SaleDetailsSheetProps) => {
  const status = sale ? paymentStatusStyles[sale.paymentStatus] : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md gap-6 overflow-y-auto"
      >
        <SheetHeader className="border-b border-border">
          <SheetTitle>Sale Details</SheetTitle>
          <SheetDescription>Order #{sale?.orderId ?? "—"}</SheetDescription>
        </SheetHeader>

        {sale && (
          <div className="flex flex-col gap-6 p-4">
            <section className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                Customer
              </h4>
              <div className="flex items-center justify-between flex-wrap">
                <span className="text-muted-foreground">Name</span>
                <p className="font-medium text-foreground">
                  {sale.customerFirstName} {sale.customerLastName}
                </p>
              </div>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-muted-foreground">Email</span>
                <p className="font-medium text-foreground truncate">
                  {sale.customerEmail}
                </p>
              </div>
              <div className="flex items-center justify-between flex-wrap">
                <span className="text-muted-foreground">Phone Number</span>
                <p className="font-medium text-foreground">
                  {sale.phoneNumber}
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-1.5">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
                Payment
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-foreground">
                  {sale.currency}{" "}
                  {Number(sale.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="capitalize text-foreground">
                  {sale.provider}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reference</span>
                <span className="text-foreground truncate max-w-45">
                  {sale.reference}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                {status && (
                  <Badge variant="secondary" className={status.className}>
                    {status.label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Purchased</span>
                <span className="text-foreground">
                  {formatDate(sale.purchasedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tickets</span>
                <span className="text-foreground">{sale.quantity}</span>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-muted-foreground" />
                Event & Tickets
              </h4>
              {sale.events.map((event) => (
                <div
                  key={event.eventId}
                  className="rounded-xl border border-border bg-card p-3 flex flex-col gap-1"
                >
                  <span className="font-medium text-foreground">
                    {event.eventTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Type:{" "}
                    <span className="font-medium">{event.ticketType}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Name:{" "}
                    <span className="font-medium">{event.ticketSummary}</span>
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {event.totalTickets} ticket
                    {event.totalTickets === 1 ? "" : "s"} ·{" "}
                    {event.checkedInCount}/{event.totalTickets} checked in
                  </span>
                </div>
              ))}
              {sale.events.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No event details available.
                </p>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
