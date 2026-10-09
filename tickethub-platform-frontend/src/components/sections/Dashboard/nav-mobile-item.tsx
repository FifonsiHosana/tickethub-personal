import React from "react";
import { useNavigate } from "react-router";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, SubNavItem } from "./nav-mobile";

const ICON_BUTTON =
  "h-12 w-12 rounded-full [&_svg]:!size-5 select-none transition-all duration-150 active:scale-90 active:font-bold";

interface NavMobileItemProps {
  item: NavItem;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClick: (e: React.MouseEvent, item: NavItem) => void;
  onSubItemClick: (subItem: SubNavItem) => void;
  longPressHandlers: {
    onMouseDown: () => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
  };
}

export function NavMobileItem({
  item,
  isOpen,
  onOpenChange,
  onClick,
  onSubItemClick,
  longPressHandlers,
}: NavMobileItemProps) {
  
  const hasSubItems = Boolean(item.items && item.items.length > 0);

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
      {...longPressHandlers}
      onClick={(e) => onClick(e, item)}
    >
      {item.icon}
      {hasSubItems && (
        <span className="absolute bottom-2 h-1 w-1 rounded-full bg-current opacity-70" />
      )}
    </Button>
  );

  if (!hasSubItems) return button;

  return (
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger>{button}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="center"
        sideOffset={14}
        className="w-64 p-2 rounded-3xl border-2 border-border bg-background text-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="flex flex-col gap-1">
          {item.items?.map((subItem) => (
            <button
              key={subItem.title}
              onClick={() => onSubItemClick(subItem)}
              className="flex items-center gap-3 px-4 py-3.5 text-lg font-medium rounded-2xl text-foreground transition-colors hover:bg-muted active:bg-muted w-full text-left"
            >
              {subItem.icon && (
                <span className="h-6 w-6 shrink-0 [&_svg]:!size-6">
                  {subItem.icon}
                </span>
              )}
              <span className="truncate">{subItem.title}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface NavMobileOverflowItemProps {
  item: NavItem;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClick: () => void;
  onSubItemClick: (subItem: SubNavItem) => void;
}

export function NavMobileOverflowItem({
  item,
  isExpanded,
  onToggleExpand,
  onClick,
  onSubItemClick,
}: NavMobileOverflowItemProps) {
  const hasSubItems = Boolean(item.items && item.items.length > 0);

  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-lg font-medium text-foreground transition-colors hover:bg-muted active:bg-muted",
          item.isActive && "bg-muted",
        )}
      >
        {item.icon && (
          <span className="h-6 w-6 shrink-0 text-foreground [&_svg]:size-6!">
            {item.icon}
          </span>
        )}
        <span className="flex-1 truncate text-left">{item.title}</span>
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
            <button
              key={subItem.title}
              onClick={() => onSubItemClick(subItem)}
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted active:bg-muted w-full text-left"
            >
              {subItem.icon && (
                <span className="h-5 w-5 shrink-0 [&_svg]:size-5!">
                  {subItem.icon}
                </span>
              )}
              <span className="truncate">{subItem.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
