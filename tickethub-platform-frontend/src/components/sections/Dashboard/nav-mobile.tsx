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
          "relative h-11 w-11 rounded-full text-muted-foreground transition-colors duration-150 select-none active:scale-95",
          item.isActive &&
            "bg-foreground text-background hover:bg-foreground/90",
          !item.isActive && "hover:bg-muted hover:text-foreground",
          isOpen && "bg-muted text-foreground",
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
          <span className="absolute bottom-1.5 h-[3px] w-[3px] rounded-full bg-current opacity-50" />
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
          sideOffset={10}
          className="w-44 p-1 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-150"
        >
          <div className="flex flex-col gap-0.5">
            {item.items?.map((subItem) => (
              <Link
                key={subItem.title}
                to={subItem.url}
                onClick={() => setOpenPopoverId(null)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
  };

  return (
    <nav
      className={cn(
        "fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border/40 bg-background/80 p-1.5 shadow-lg backdrop-blur-xl",
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
                "h-11 w-11 rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                openPopoverId === "__overflow__" && "bg-muted text-foreground",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="end"
            sideOffset={10}
            className="w-56 p-1 rounded-2xl border border-border/60 bg-background/95 backdrop-blur-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-150"
          >
            <div className="flex flex-col gap-0.5">
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
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      {item.icon && (
                        <span className="h-4 w-4 shrink-0">{item.icon}</span>
                      )}
                      <span className="flex-1 truncate text-left">
                        {item.title}
                      </span>
                      {hasSubItems && (
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                      )}
                    </button>
                    {hasSubItems && isExpanded && (
                      <div className="mb-1 ml-4 flex flex-col gap-0.5 border-l border-border/60 pl-2.5">
                        {item.items?.map((subItem) => (
                          <Link
                            key={subItem.title}
                            to={subItem.url}
                            onClick={() => {
                              setOpenPopoverId(null);
                              setExpandedOverflow(null);
                            }}
                            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {subItem.icon && (
                              <span className="h-3.5 w-3.5 shrink-0">
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
