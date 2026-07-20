import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTicketSalesBreakdown } from "@/hooks/organizers/useOrganizerSales";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const TicketPerformanceChart = () => {
  const { data, isLoading } = useTicketSalesBreakdown();

  const formattedData = useMemo(() => {
    if (!data) return [];
    // Sort by sold amount to show top performers first
    return [...data].sort((a, b) => b.sold - a.sold);
  }, [data]);

  return (
    <Card className="col-span-1 lg:col-span-5 shadow-sm">
      <CardHeader>
        <CardTitle>Sales by Ticket Tier</CardTitle>
        <CardDescription>Volume of tickets sold per category</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-87.5 flex items-center justify-center text-muted-foreground">
            Loading chart...
          </div>
        ) : (
          <div className="h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedData}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#e5e7eb"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="ticketName"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#1a201c", fontWeight: 500 }}
                  width={90}
                />
                <Tooltip
                  cursor={{ fill: "#f3f4f6" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} units`, "Sold"]}
                />
                <Bar
                  dataKey="sold"
                  fill="#1a201c"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
