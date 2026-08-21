import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = {
  label: string;
  sent: number;
  delivered: number;
};

const data: Point[] = [
  { label: "Mon", sent: 1200, delivered: 1150 },
  { label: "Tue", sent: 5900, delivered: 1820 },
  { label: "Wed", sent: 800, delivered: 770 },
  { label: "Thu", sent: 8400, delivered: 8310 },
  { label: "Fri", sent: 3200, delivered: 3080 },
  { label: "Sat", sent: 8100, delivered: 3980 },
  { label: "Sun", sent: 2600, delivered: 2520 },
];

const axisStyle = {
  fontSize: 12,
  fill: "var(--muted-foreground)",
};

export const DeliveryChart: React.FC = () => {
  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">Delivery Overview</h3>
          <p className="text-sm text-muted-foreground">Last 7 days</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary/40" />
            Sent
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-primary" />
            Delivered
          </span>
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
          >
            <defs>
              <linearGradient id="sentFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="deliveredFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={axisStyle}
            />
            <YAxis tickLine={false} axisLine={false} tick={axisStyle} width={48} />
            <Tooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                background: "#fff",
                fontSize: "0.8rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="sent"
              name="Sent"
              stroke="var(--primary)"
              strokeOpacity={0.4}
              strokeWidth={2}
              fill="url(#sentFill)"
            />
            <Area
              type="monotone"
              dataKey="delivered"
              name="Delivered"
              stroke="var(--primary)"
              strokeWidth={2}
              fill="url(#deliveredFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
