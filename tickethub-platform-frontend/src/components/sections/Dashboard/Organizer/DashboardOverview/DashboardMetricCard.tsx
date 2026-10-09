import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
}

export default function DashboardMetricCard({
  title,
  value,
  icon: Icon,
}: Props) {
  return (
    <div className="flex min-h-16 w-full min-w-0 items-center gap-2.5 rounded-lg border border-gray-300 bg-card px-3 py-2 dark:border-none">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md">
        <Icon className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
          {title}
        </p>
        <p className="truncate text-sm leading-tight font-semibold">{value}</p>
      </div>
    </div>
  );
}
