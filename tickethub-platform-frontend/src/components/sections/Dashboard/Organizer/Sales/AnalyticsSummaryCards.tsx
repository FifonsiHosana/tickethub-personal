// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesSummary } from "@/hooks/organizers/useOrganizerSales";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import {
  BanknoteIcon,
  CreditCardIcon,
  TicketIcon,
  XCircleIcon,
} from "lucide-react";

interface AnalyticsSummaryCardsProps {
  eventId?: number;
  ticketId?: number;
}

export const AnalyticsSummaryCards = ({
  eventId,
  ticketId,
}: AnalyticsSummaryCardsProps = {}) => {
  const { range } = useDashboardDateRange();
  const { data: summary } = useSalesSummary({
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
    eventId,
    ticketId,
  });

  const stats = summary || {
    totalRevenue: 0,
    completedOrders: 0,
    ticketsSold: 0,
    failedPayments: 0,
  };

  const cards = [
    {
      title: "Net Revenue",
      value: `GH₵ ${stats.totalRevenue.toLocaleString()}`,
      icon: BanknoteIcon,
    },
    {
      title: "Tickets Sold",
      value: stats.ticketsSold.toLocaleString(),
      icon: TicketIcon,
    },
    {
      title: "Completed Orders",
      value: stats.completedOrders.toLocaleString(),
      icon: CreditCardIcon,
    },
    {
      title: "Failed Payments",
      value: stats.failedPayments.toLocaleString(),
      icon: XCircleIcon,
    },
  ];

  return (
    <div className="grid gap-1 grid-cols-2 lg:grid-cols-4">
      {/* {cards.map((card, idx) => (
        <Card size="sm" key={idx} className="shadow-sm lg:h-22">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-foreground">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))} */}
      {cards.map((card, idx) => (
        <div
          key={`${card.title}-${idx}`}
          className="flex items-center gap-2.5 rounded-lg border border-gray-300 dark:border-none bg-card px-3 py-2"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
            <card.icon className="text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
              {card.title}
            </p>
            <p className="text-sm leading-tight font-semibold">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
