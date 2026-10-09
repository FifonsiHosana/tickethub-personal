import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";

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
      className="group block w-full min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex min-h-16 w-full min-w-0 gap-0.5 rounded-lg border  ring-1 ring-primary/40 bg-primary/70 px-3 py-2 transition-colors hover:bg-primary/40 dark:border-none items-center justify-center flex-col">
        <Icon className="transition-transform duration-200 group-hover:scale-110" />
        <p className="truncate text-sm tracking-wider uppercase font-semibold">
          {title}
        </p>
        {/* <div className="min-w-0"> */}
        {/* {count && (
            <p className="truncate text-sm leading-tight font-semibold text-foreground">
              {count}
            </p>
          )} */}
        {/* </div> */}
      </div>
    </Link>
  );
}
