import {
  BanknoteIcon,
  CheckCircleIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrganizerDashboardData } from "@/hooks/organizers/useDashboardData";
import type { OrganizerEventDetail } from "@/utils/services/organizers/events.service";

interface Props {
  event: OrganizerEventDetail;
}

function money(value?: number) {
  return `GHS ${Number(value ?? 0).toLocaleString()}`;
}

export function EventOverviewTab({ event }: Props) {
  const { range } = useDashboardDateRange();
  const { data } = useOrganizerDashboardData({
    eventId: event.id,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  });
  const stats = data?.statistics;
  const ticketTotals = (event.tickets ?? []).reduce(
    (acc, ticket) => ({
      sold: acc.sold + Number(ticket.totalSold ?? 0),
      remaining: acc.remaining + Number(ticket.remaining ?? 0),
    }),
    { sold: 0, remaining: 0 },
  );

  const cards = [
    { label: "Revenue", value: money(stats?.totalRevenue), icon: BanknoteIcon },
    {
      label: "Orders",
      value: stats?.totalOrders?.toLocaleString() ?? "0",
      icon: CheckCircleIcon,
    },
    {
      label: "Tickets sold",
      value: (stats?.totalTicketsSold ?? ticketTotals.sold).toLocaleString(),
      icon: TicketIcon,
    },
    {
      label: "Check-ins",
      value: stats?.totalCheckIns?.toLocaleString() ?? "0",
      icon: UsersIcon,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between pt-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
              <item.icon className="h-5 w-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ticket types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(event.tickets ?? []).map((ticket, index) => (
            <div
              key={ticket.id}
              className={`flex items-center justify-between   p-3 text-sm ${event.tickets?.length! - 1 !== index && `border-b-2 `}`}
            >
              <div>
                <p className="font-medium">
                  {ticket.ticketType ||
                    ticket.name ||
                    `Ticket type ${index + 1}`}
                </p>
                <p className="text-muted-foreground">
                  {ticket.totalSold} / {ticket.totalCount} sold ·{" "}
                  {ticket.remaining} remaining
                </p>
              </div>
              <p className="font-semibold">
                GHS {Number(ticket.price).toLocaleString()}
              </p>
            </div>
          ))}
          {!event.tickets?.length && (
            <p className="text-sm text-muted-foreground">
              No ticket types found.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
