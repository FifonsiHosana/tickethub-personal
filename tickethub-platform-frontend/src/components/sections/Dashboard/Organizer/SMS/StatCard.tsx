import React from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: React.ReactNode;
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  delta,
  trend = "up",
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        {delta && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              trend === "up"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-rose-100 text-rose-700"
            )}
          >
            {trend === "up" ? "Γû▓" : "Γû╝"} {delta}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
};
