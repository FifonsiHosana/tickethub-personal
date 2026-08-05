import { format } from "date-fns";
import { MoreHorizontalIcon, EyeIcon, EditIcon, BanIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";
import { statusColor, approvalColor } from "@/utils/statusColors";

interface Props {
  event: OrganizerEventResponse;
  onViewDetails: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

export function EventTableRow({
  event,
  onViewDetails,
  onEdit,
  onCancel,
}: Props) {
  return (
    <TableRow
      className="cursor-pointer border-border transition-colors"
      onClick={onViewDetails}
    >
      <TableCell className="pl-6 font-medium border-border">
        <div className="flex flex-col">
          <span>{event.title}</span>
          {event.description && (
            <span className="text-xs text-muted-foreground truncate max-w-62.5">
              {event.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-sm border-border">
        {format(new Date(event.dateAndTime), "MMM d, yyyy • h:mm a")}
      </TableCell>
      <TableCell className="text-sm border-border">
        {event.capacity.toLocaleString()}
      </TableCell>
      <TableCell className="border-border">
        <Badge
          variant="secondary"
          className={`border ${
            statusColor[event.status] ?? "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
          }`}
        >
          {event.status}
        </Badge>
      </TableCell>
      <TableCell className="border-border">
        <Badge
          variant="secondary"
          className={`border-0 ${
            approvalColor[event.approvalStatus] ??
            "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"
          }`}
        >
          {event.approvalStatus}
        </Badge>
      </TableCell>
      <TableCell
        className="text-right pr-6 border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontalIcon className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails}>
              <EyeIcon className="h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <EditIcon className="h-4 w-4" /> Edit Event
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onCancel}
              className="text-red-600 focus:bg-red-500/10 focus:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
            >
              <BanIcon className="h-4 w-4" /> Cancel Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
