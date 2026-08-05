import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesSummary } from "@/hooks/organizers/useOrganizerSales";
import {
  BanknoteIcon,
  CreditCardIcon,
  TicketIcon,
  XCircleIcon,
} from "lucide-react";

export const AnalyticsSummaryCards = () => {
  const { data: summary } = useSalesSummary();

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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      {cards.map((card, idx) => (
        <Card key={idx} className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
