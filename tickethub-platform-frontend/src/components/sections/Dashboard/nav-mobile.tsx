import React, { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  longPressDelay?: number; // In milliseconds (default: 500)
}

export function NavMobile({
  items,
  className,
  longPressDelay = 500,
}: PinterestNavProps) {
  const navigate = useNavigate();
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressRef = useRef(false);

  // Start Long Press timer
  const startPress = useCallback(
    (item: NavItem) => {
      isLongPressRef.current = false;

      // Only set timer if there are sub-items
      if (item.items && item.items.length > 0) {
        timerRef.current = setTimeout(() => {
          isLongPressRef.current = true;
          setOpenPopoverId(item.title);
          // Haptic feedback for touch devices
          if ("vibrate" in navigator) {
            navigator.vibrate(50);
          }
        }, longPressDelay);
      }
    },
    [longPressDelay],
  );

  // Cancel timer on release/leave
  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Handle standard click vs long press
  const handleClick = (e: React.MouseEvent, item: NavItem) => {
    cancelPress();
    if (isLongPressRef.current) {
      e.preventDefault(); // Prevent standard navigation if long press was activated
      isLongPressRef.current = false;
      return;
    }
    // If popover is already open, click closes it
    if (openPopoverId === item.title) {
      setOpenPopoverId(null);
      e.preventDefault();
    } else {
      navigate(item.url);
    }
  };

  return (
    <TooltipProvider 
    // delayDuration={300}
    >
      <nav
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 p-2 rounded-full border border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:shadow-primary/5",
          className,
        )}
      >
        {items.map((item) => {
          const hasSubItems = Boolean(item.items && item.items.length > 0);
          const isOpen = openPopoverId === item.title;

          const buttonContent = (
            <Button
              variant={item.isActive ? "default" : "ghost"}
              size="icon"
              className={cn(
                "relative h-12 w-12 rounded-full transition-all duration-200 select-none active:scale-95",
                item.isActive &&
                  "shadow-md bg-primary text-primary-foreground hover:bg-primary/90",
                !item.isActive &&
                  "hover:bg-muted text-muted-foreground hover:text-foreground",
                isOpen &&
                  "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
              onMouseDown={() => startPress(item)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={() => startPress(item)}
              onTouchEnd={cancelPress}
              onClick={(e) => handleClick(e, item)}
            >
              {item.icon}

              {/* Sub-item Indicator Dot */}
              {hasSubItems && (
                <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-current opacity-60" />
              )}
            </Button>
          );

          if (!hasSubItems) {
            return (
              <Tooltip key={item.title}>
                <TooltipTrigger >{buttonContent}</TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="rounded-full text-xs font-medium px-3 py-1"
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Popover
              key={item.title}
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) setOpenPopoverId(null);
              }}
            >
              <Tooltip>
                <TooltipTrigger >
                  <PopoverTrigger >{buttonContent}</PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="rounded-full text-xs font-medium px-3 py-1"
                >
                  {item.title}{" "}
                  <span className="opacity-50 text-[10px]">(Hold)</span>
                </TooltipContent>
              </Tooltip>

              {/* Pinterest Radial / Sub-menu Popover */}
              <PopoverContent
                side="top"
                align="center"
                sideOffset={12}
                className="w-48 p-1.5 rounded-2xl border border-border/60 bg-background/90 backdrop-blur-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200"
              >
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2.5 py-1 mb-1">
                  {item.title}
                </div>
                <div className="flex flex-col gap-0.5">
                  {item.items?.map((subItem) => (
                    <Link
                      key={subItem.title}
                      to={subItem.url}
                      onClick={() => setOpenPopoverId(null)}
                      className="flex items-center gap-2.5 px-2.5 py-2 text-sm font-medium rounded-xl hover:bg-muted/80 hover:text-foreground text-muted-foreground transition-colors"
                    >
                      {subItem.icon && (
                        <span className="h-4 w-4 shrink-0">{subItem.icon}</span>
                      )}
                      <span className="truncate">{subItem.title}</span>
                    </Link>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
