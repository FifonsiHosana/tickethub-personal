import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRevenueBreakdown } from "@/hooks/organizers/useOrganizerSales";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

export const RevenueChart = ({ from, to }: { from: string; to: string }) => {
  const { data, isLoading } = useRevenueBreakdown(from, to);

  const formattedData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      displayDate: format(parseISO(item.date), "MMM dd"),
      revenueNum: Number(item.revenue),
    }));
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-7 shadow-sm">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          Daily earnings over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-87.5 flex items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : (
          <div className="h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formattedData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis
                  dataKey="displayDate"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickFormatter={(value) => `GH₵${value}`}
                />
                <Tooltip
                  cursor={{
                    stroke: "var(--primary)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [
                    `GH₵ ${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                  labelStyle={{
                    color: "#1a201c",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenueNum"
                  stroke="#1a201c"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
