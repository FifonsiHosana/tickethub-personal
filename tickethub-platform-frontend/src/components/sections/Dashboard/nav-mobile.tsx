import { Link, useLocation } from "react-router";
import type { NavItem } from "@/misc/dashboardData";
import { cn } from "@/lib/utils";

interface NavMobileProps {
  items: NavItem[];
  className?: string;
}

function isNavItemActive(item: NavItem, pathname: string) {
  const exactPaths = item.activePaths ?? [item.url];
  const exactMatch = exactPaths.some((path) => pathname === path);
  const prefixMatch = item.activePrefixes?.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  return exactMatch || Boolean(prefixMatch);
}

export function NavMobile({ items, className }: NavMobileProps) {
  const { pathname } = useLocation();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 py-2 text-foreground shadow-2xl backdrop-blur md:hidden",
        className,
      )}
    >
      <div className="flex gap-2 overflow-x-auto pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const isActive = isNavItemActive(item, pathname);

          return (
            <Link
              key={item.title}
              to={item.url}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-18 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
                "[&_svg]:size-5",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {item.icon}
              <span className="whitespace-nowrap">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

