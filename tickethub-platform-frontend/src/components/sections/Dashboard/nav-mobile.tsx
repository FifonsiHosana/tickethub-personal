// import { Link, useLocation } from "react-router";
// import type { NavItem } from "@/misc/dashboardData";
// import { cn } from "@/lib/utils";

// interface NavMobileProps {
//   items: NavItem[];
//   className?: string;
// }

// function isNavItemActive(item: NavItem, pathname: string) {
//   const exactPaths = item.activePaths ?? [item.url];
//   const exactMatch = exactPaths.some((path) => pathname === path);
//   const prefixMatch = item.activePrefixes?.some(
//     (path) => pathname === path || pathname.startsWith(`${path}/`),
//   );

//   return exactMatch || Boolean(prefixMatch);
// }

// export function NavMobile({ items, className }: NavMobileProps) {
//   const { pathname } = useLocation();

//   return (
//     <nav
//       className={cn(
//         "fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-2 py-2 text-foreground shadow-2xl backdrop-blur md:hidden",
//         className,
//       )}
//     >
//       <div className="flex gap-2 overflow-x-auto pb-[env(safe-area-inset-bottom)]">
//         {items.map((item) => {
//           const isActive = isNavItemActive(item, pathname);

//           return (
//             <Link
//               key={item.title}
//               to={item.url}
//               aria-current={isActive ? "page" : undefined}
//               className={cn(
//                 "flex min-w-18 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
//                 "text-muted-foreground hover:bg-muted hover:text-foreground",
//                 "[&_svg]:size-5",
//                 isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
//               )}
//             >
//               {item.icon}
//               <span className="whitespace-nowrap">{item.title}</span>
//             </Link>
//           );
//         })}
//       </div>
//     </nav>
//   );
// }
import React, { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubNavItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  items?: SubNavItem[];
}

interface PinterestNavProps {
  items: NavItem[];
  className?: string;
  longPressDelay?: number; // ms, default 450
  maxVisible?: number; // primary icons shown before collapsing into "More"
}

// Shared sizing: big touch targets, big icons
const ICON_BUTTON =
  "h-12 w-12 rounded-full [&_svg]:!size-5 select-none transition-all duration-150 active:scale-90 active:font-bold";

export function NavMobile({
  items,
  className,
  longPressDelay = 450,
  maxVisible = 5,
}: PinterestNavProps) {
  const navigate = useNavigate();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [expandedOverflow, setExpandedOverflow] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  const showOverflow = items.length > maxVisible;
  const visibleItems = showOverflow ? items.slice(0, maxVisible - 1) : items;
  const overflowItems = showOverflow ? items.slice(maxVisible - 1) : [];

  const startPress = useCallback(
    (item: NavItem) => {
      isLongPressRef.current = false;
      if (item.items && item.items.length > 0) {
        timerRef.current = setTimeout(() => {
          isLongPressRef.current = true;
          setOpenPopoverId(item.title);
          if ("vibrate" in navigator) navigator.vibrate(50);
        }, longPressDelay);
      }
    },
    [longPressDelay],
  );

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = (e: React.MouseEvent, item: NavItem) => {
    cancelPress();
    if (isLongPressRef.current) {
      e.preventDefault();
      isLongPressRef.current = false;
      return;
    }
    if (openPopoverId === item.title) {
      setOpenPopoverId(null);
      e.preventDefault();
    } else {
      navigate(item.url);
    }
  };

  const renderPrimaryIcon = (item: NavItem) => {
    const hasSubItems = Boolean(item.items && item.items.length > 0);
    const isOpen = openPopoverId === item.title;

    const button = (
      <Button
        variant="ghost"
        size="icon"
        aria-label={item.title}
        className={cn(
          ICON_BUTTON,
          "relative",
          item.isActive
            ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground"
            : "text-foreground hover:bg-muted hover:text-foreground",
          isOpen && !item.isActive && "bg-muted text-foreground",
        )}
        onMouseDown={() => startPress(item)}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={() => startPress(item)}
        onTouchEnd={cancelPress}
        onClick={(e) => handleClick(e, item)}
      >
        {item.icon}
        {hasSubItems && (
          <span className="absolute bottom-2 h-1 w-1 rounded-full bg-current opacity-70" />
        )}
      </Button>
    );

    if (!hasSubItems) return button;

    return (
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) setOpenPopoverId(null);
        }}
      >
        <PopoverTrigger>{button}</PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          sideOffset={14}
          className="w-64 p-2 rounded-3xl border-2 border-border bg-background text-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex flex-col gap-1">
            {item.items?.map((subItem) => (
              <Link
                key={subItem.title}
                to={subItem.url}
                onClick={() => setOpenPopoverId(null)}
                className="flex items-center gap-3 px-4 py-3.5 text-lg font-medium rounded-2xl text-foreground transition-colors hover:bg-muted active:bg-muted"
              >
                {subItem.icon && (
                  <span className="h-6 w-6 shrink-0 [&_svg]:!size-6">
                    {subItem.icon}
                  </span>
                )}
                <span className="truncate">{subItem.title}</span>
              </Link>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <nav
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border-2 border-border bg-background p-3 text-foreground shadow-2xl ring-1 ring-foreground/10",
        className,
      )}
    >
      {visibleItems.map((item) => (
        <React.Fragment key={item.title}>
          {renderPrimaryIcon(item)}
        </React.Fragment>
      ))}

      {showOverflow && (
        <Popover
          open={openPopoverId === "__overflow__"}
          onOpenChange={(open) =>
            setOpenPopoverId(open ? "__overflow__" : null)
          }
        >
          <PopoverTrigger>
            <Button
              variant="ghost"
              size="icon"
              aria-label="More"
              className={cn(
                ICON_BUTTON,
                "text-foreground hover:bg-muted hover:text-foreground",
                openPopoverId === "__overflow__" && "bg-muted",
              )}
            >
              <MoreHorizontal />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={14}
            className="w-72 p-2 rounded-3xl border-2 border-border bg-background text-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="flex flex-col gap-1">
              {overflowItems.map((item) => {
                const hasSubItems = Boolean(
                  item.items && item.items.length > 0,
                );
                const isExpanded = expandedOverflow === item.title;
                return (
                  <div key={item.title}>
                    <button
                      onClick={() => {
                        if (hasSubItems) {
                          setExpandedOverflow(isExpanded ? null : item.title);
                        } else {
                          setOpenPopoverId(null);
                          navigate(item.url);
                        }
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-lg font-medium text-foreground transition-colors hover:bg-muted active:bg-muted",
                        item.isActive && "bg-muted",
                      )}
                    >
                      {item.icon && (
                        <span className="h-6 w-6 shrink-0 text-foreground [&_svg]:!size-6">
                          {item.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate text-left">
                        {item.title}
                      </span>
                      {hasSubItems && (
                        <ChevronRight
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                      )}
                    </button>
                    {hasSubItems && isExpanded && (
                      <div className="mb-1 ml-6 flex flex-col gap-1 border-l-2 border-border pl-3">
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.title}
                            to={subItem.url}
                            onClick={() => {
                              setOpenPopoverId(null);
                              setExpandedOverflow(null);
                            }}
                            className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted active:bg-muted"
                          >
                            {subItem.icon && (
                              <span className="h-5 w-5 shrink-0 [&_svg]:size-5!">
                                {subItem.icon}
                              </span>
                            )}
                            <span className="truncate">{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </nav>
  );
}
