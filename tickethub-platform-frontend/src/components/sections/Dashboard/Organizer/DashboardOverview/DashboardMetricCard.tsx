import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="h-full w-full max-w-full min-w-0 overflow-hidden">
      <CardHeader className="flex min-w-0 flex-row items-center justify-between gap-3 pb-2">
        <CardTitle className="text-sm font-medium leading-tight">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="break-words text-2xl font-bold tracking-tight">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

