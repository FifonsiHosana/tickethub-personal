import { Link } from "react-router";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { OrderHistoryOrder, OrderHistoryTicket } from "@/utils/services/attendees/orders.service";
import { eventSummary, formatOrderDate, ticketCountLabel, ticketLabel } from "./orderHistoryUtils";

interface Props {
  order: OrderHistoryOrder | null;
  showBack?: boolean;
}

function ticketStatusClass(ticket: OrderHistoryTicket) {
  return ticket.checkedIn
    ? "bg-amber-500/15 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
    : "bg-green-500/15 text-green-700 dark:bg-green-500/10 dark:text-green-400";
}

export default function OrderDetailPanel({ order, showBack = false }: Props) {
  if (!order) {
    return (
      <Card className="hidden min-h-96 items-center justify-center lg:flex">
        <p className="text-sm text-muted-foreground">Select an order to view tickets.</p>
      </Card>
    );
  }

  return (
    <Card className="min-h-0">
      <CardHeader className="border-b border-border">
        {showBack && (
          <Button
            variant="ghost"
            className="mb-2 w-fit px-0"
            render={<Link to="/ticket-order-history"><ArrowLeftIcon /> Back</Link>}
          />
        )}
        <div className="space-y-1">
          <CardTitle className="text-xl">Order #{order.orderId}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {formatOrderDate(order.paidAt ?? order.purchasedAt)}
          </p>
          <p className="text-sm text-muted-foreground">{eventSummary(order)}</p>
          <p className="text-sm font-medium text-foreground">
            {ticketCountLabel(order.totalTickets)}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4">
        {order.events.map((event) => (
          <section key={event.eventId} className="space-y-3">
            <div>
              <h2 className="font-semibold text-foreground">{event.eventTitle}</h2>
              <p className="text-xs text-muted-foreground">{formatOrderDate(event.eventDate)}</p>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              {event.tickets.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className={cn("flex items-center gap-3 p-3", index > 0 && "border-t border-border")}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-foreground">
                      {ticket.ticketType || ticketLabel(event)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ticket.holderName || "Ticket holder"}
                    </p>
                    {!ticket.qrCodeUrl && (
                      <p className="mt-1 text-xs font-medium text-muted-foreground">Ticket not ready.</p>
                    )}
                  </div>
                  <Badge className={cn("border", ticketStatusClass(ticket))} variant="secondary">
                    {ticket.checkedIn ? "Used" : "Valid"}
                  </Badge>
                  {ticket.qrCodeUrl ? (
                    <Button
                      size="sm"
                      variant="outline"
                      render={<a href={ticket.qrCodeUrl} target="_blank" rel="noreferrer">View ticket <ExternalLinkIcon /></a>}
                    />
                  ) : (
                    <Button size="sm" variant="outline" disabled>View ticket</Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}
