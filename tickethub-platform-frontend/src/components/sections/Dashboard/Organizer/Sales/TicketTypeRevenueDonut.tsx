import { useMemo } from "react";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTicketSalesBreakdown } from "@/hooks/organizers/useOrganizerSales";
import { PieChart, Pie, Tooltip, ResponsiveContainer, Sector } from "recharts";
import { Loader2Icon } from "lucide-react";

const PALETTE = [
  "#f59e0b",
  "#3b82f6",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

export const TicketTypeRevenueDonut = ({
  from,
  to,
  eventId,
  ticketId,
}: {
  from?: string;
  to?: string;
  eventId?: number;
  ticketId?: number;
}) => {
  const { data, isLoading } = useTicketSalesBreakdown({
    from,
    to,
    eventId,
    ticketId,
  });

  const chartData = useMemo(() => {
    if (!data) return [];
    return [...data]
      .sort((a, b) => Number(b.revenue) - Number(a.revenue))
      .map((item) => ({
        name: item.ticketName,
        value: Number(item.revenue),
      }));
  }, [data]);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="col-span-1 lg:col-span-3 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle>Ticket Type Revenue Share</CardTitle>
        {/* <CardDescription>
          Proportion of revenue by ticket tier
        </CardDescription> */}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-36 flex items-center justify-center text-muted-foreground">
            <Loader2Icon className="h-8 w-8 animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-36 flex items-center justify-center text-muted-foreground">
            No data available.
          </div>
        ) : (
          <div className="flex flex-row items-center md:flex-col gap-4">
            <div className="relative h-36 w-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
                    outerRadius={70}
                    paddingAngle={2}
                    strokeWidth={0}
                    shape={(props) => {
                      const {
                        cx,
                        cy,
                        innerRadius,
                        outerRadius,
                        startAngle,
                        endAngle,
                        index,
                      } = props;
                      return (
                        <Sector
                          cx={cx}
                          cy={cy}
                          innerRadius={innerRadius}
                          outerRadius={outerRadius}
                          startAngle={startAngle}
                          endAngle={endAngle}
                          fill={PALETTE[index % PALETTE.length]}
                        />
                      );
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => [
                      `GH₵ ${Number(value).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-foreground">
                  GH₵ {total.toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">
                  total revenue
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
              {chartData.slice(0, 6).map((item, index) => (
                <div
                  key={`${index}-${item.name}`}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: PALETTE[index % PALETTE.length],
                      }}
                    />
                    <span className="text-foreground truncate">
                      {item.name || "—"}
                    </span>
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {total > 0
                      ? `${Math.round((item.value / total) * 100)}%`
                      : "0%"}
                  </span>
                </div>
              ))}
              {chartData.length > 6 && (
                <p className="text-xs text-muted-foreground">
                  +{chartData.length - 6} more
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
