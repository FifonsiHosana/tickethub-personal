import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Small helper so we're not repeating the truncate + tooltip markup for every cell
export function TruncatedCell({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className={cn("block truncate", className)}>{value}</span>
        }
      />
      <TooltipContent>{value}</TooltipContent>
    </Tooltip>
  );
}
