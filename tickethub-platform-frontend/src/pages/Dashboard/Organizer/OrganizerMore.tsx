import { Link } from "react-router";
import { ArrowRightIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const links = [
  { title: "Ticket Sales", url: "/organizer/sales" },
  { title: "Sales Analytics", url: "/organizer/sales/analytics" },
  { title: "Event Performance", url: "/organizer/analytics/events" },
  // { title: "Revenue & Payouts", url: "/organizer/analytics/revenue" },
  { title: "Ticket Performance", url: "/organizer/analytics/tickets" },
  { title: "SMS History", url: "/organizer/sms/history" },
  { title: "SMS Credits", url: "/organizer/sms/credits" },
  // { title: "Payout Settings", url: "/organizer/payout-settings" },
  { title: "Ticket Order History", url: "/ticket-order-history" },
];

export default function OrganizerMorePage() {
  return (
    <section className="space-y-4">
      <div>
        {/* <h1 className="text-2xl font-semibold text-foreground">
          Organizer tools
        </h1> */}
        {/* <p className="text-sm text-muted-foreground">
          
        </p> */}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Organizer tools</CardTitle>
          <CardDescription>
            Advanced organizer tools and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {links.map((link) => (
            <Link
              key={link.url}
              to={link.url}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <span>{link.title}</span>
              <ArrowRightIcon className="size-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
