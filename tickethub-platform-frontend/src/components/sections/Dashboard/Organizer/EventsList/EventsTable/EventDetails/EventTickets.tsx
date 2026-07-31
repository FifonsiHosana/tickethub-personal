import { Ticket } from "lucide-react";

interface TicketProps {
  id: number;
  name: string;
  ticketType: string;
  price: number | string;
  totalSold: number;
  totalCount: number;
  remaining: number;
}

interface EventTicketsProps {
  tickets?: TicketProps[];
}

export function EventTickets({ tickets }: EventTicketsProps) {
  if (!tickets || tickets.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Ticket className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-base">Tickets Overview</h3>
      </div>
      <div className="space-y-2">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="flex items-center justify-between p-3 rounded-lg border border-muted-foreground/10 bg-muted/30"
          >
            <div>
              <p className="font-medium text-sm">
                {ticket.name}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  ({ticket.ticketType})
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ticket.totalSold} / {ticket.totalCount} sold
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm">GHS {ticket.price}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {ticket.remaining} left
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}