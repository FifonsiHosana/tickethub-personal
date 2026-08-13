import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DATE_FILTER_OPTIONS,
  labelForPreset,
  type DatePreset,
} from "@/utils/dateRanges";
import { useDashboardDateRange } from "./useDashboardDateRange";
import { CustomRangePopover } from "./CustomRangePopover";

export function DateRangeFilter() {
  const { preset, customRange, setPreset, applyCustomRange } =
    useDashboardDateRange();
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleValueChange = (value: DatePreset | null) => {
    if (value === "custom") {
      setPreset(value);
      setPopoverOpen(true);
      return;
    }
    if (value) {
      setPreset(value);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Select
          items={DATE_FILTER_OPTIONS}
          value={preset}
          onValueChange={handleValueChange}
        >
          <SelectTrigger className="w-auto gap-1.5 px-2 sm:px-3">
            <CalendarDays className="size-4 text-muted-foreground shrink-0" />
            <SelectValue>
              <span className="hidden sm:inline">
                {preset ? labelForPreset(preset) : ""}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {DATE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value === "custom"
                    ? labelForPreset("custom")
                    : option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {preset === "custom" && (
          <CustomRangePopover
            key={popoverOpen ? "open" : "closed"}
            open={popoverOpen}
            onOpenChange={setPopoverOpen}
            initial={customRange}
            onApply={applyCustomRange}
          >
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 px-2 sm:px-3"
              aria-label="Set custom date range"
            >
              <CalendarDays className="size-4 sm:hidden" />
              <span className="hidden sm:inline">Set Dates</span>
            </Button>
          </CustomRangePopover>
        )}
      </div>
    </>
  );
}
