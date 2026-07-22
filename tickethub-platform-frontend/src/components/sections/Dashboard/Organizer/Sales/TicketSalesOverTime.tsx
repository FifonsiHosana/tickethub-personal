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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Loader2Icon } from "lucide-react";

export const TicketSalesOverTime = ({
  from,
  to,
}: {
  from: string;
  to: string;
}) => {
  const { data, isLoading } = useRevenueBreakdown(from, to);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((item) => ({
      ...item,
      displayDate: format(parseISO(item.date), "MMM dd"),
      sales: Number(item.transactions),
    }));
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-7 shadow-sm">
      <CardHeader>
        <CardTitle>Ticket Sales Over Time</CardTitle>
        <CardDescription>
          Daily transaction volume over the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-87.5 flex items-center justify-center text-muted-foreground">
            <Loader2Icon className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
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
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ stroke: "var(--primary)", strokeWidth: 1 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} transactions`, "Sales"]}
                  labelStyle={{
                    color: "#1a201c",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
