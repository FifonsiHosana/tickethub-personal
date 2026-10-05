import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminOrganizerStats } from "@/utils/services/admin/users.service";
import { money } from "./format";

const labels: Array<[keyof AdminOrganizerStats, string, "money" | "number"]> = [
  ["totalOrders", "Total orders", "number"],
  ["totalAmount", "Total amount", "money"],
  ["totalFeeAmount", "Total fee amount", "money"],
  ["totalTicketsSold", "Tickets sold", "number"],
  ["totalEvents", "Total events", "number"],
  ["publishedEvents", "Published events", "number"],
  ["averageOrderValue", "Avg. order value", "money"],
];

export function OrganizerStatsRow({ stats }: { stats?: AdminOrganizerStats }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {labels.map(([key, label, type]) => (
        <Card key={key} size="sm">
          <CardHeader><CardTitle className="text-xs text-muted-foreground">{label}</CardTitle></CardHeader>
          <CardContent className="text-xl font-semibold">
            {type === "money" ? money(stats?.[key]) : Number(stats?.[key] ?? 0).toLocaleString()}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
