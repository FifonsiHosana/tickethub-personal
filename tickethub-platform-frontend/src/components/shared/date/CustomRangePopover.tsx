import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DateRange } from "@/utils/dateRanges";

interface CustomRangePopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: DateRange;
  onApply: (range: DateRange) => void;
  children: React.ReactElement; // the trigger element (e.g. the "Set Dates" button)
}

export function CustomRangePopover({
  open,
  onOpenChange,
  initial,
  onApply,
  children,
}: CustomRangePopoverProps) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);

  const invalid = !from || !to || from > to;

  const handleApply = () => {
    if (!from || !to || from > to) return;
    onApply({ from, to });
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={children}></PopoverTrigger>
      <PopoverContent className="w-72" align="start">
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="custom-from">From</Label>
            <Input
              id="custom-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="custom-to">To</Label>
            <Input
              id="custom-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" disabled={invalid} onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
