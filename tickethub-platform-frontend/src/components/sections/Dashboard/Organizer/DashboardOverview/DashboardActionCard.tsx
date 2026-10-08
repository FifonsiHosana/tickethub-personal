import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Props {
  title: string;
  count?: string;
  href: string;
  icon: LucideIcon;
}

export default function DashboardActionCard({
  title,
  count,
  href,
  icon: Icon,
}: Props) {
  return (
    <Link
      to={href}
      className="group block w-full max-w-full min-w-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="flex flex-col items-center justify-center gap-2.5 h-full w-full bg-primary text-primary-foreground p-5 cursor-pointer select-none rounded-xl border border-primary/20 shadow transition-all duration-200 group-hover:bg-primary/92 group-hover:shadow-lg group-hover:-translate-y-1 group-active:translate-y-0 group-active:scale-[0.97] group-active:shadow-sm">
        <Icon className="h-6 w-6 shrink-0 transition-transform duration-200 group-hover:scale-110" />
        <div className="text-center">
          <span className="text-sm font-semibold tracking-wide block">
            {title}
          </span>
          {count && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-foreground/15 text-primary-foreground font-medium">
              {count}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
