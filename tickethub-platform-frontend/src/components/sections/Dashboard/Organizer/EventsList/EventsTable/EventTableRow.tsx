import { format } from "date-fns";
import {
  BanIcon,
  CheckCircleIcon,
  EditIcon,
  EyeIcon,
  MoreHorizontalIcon,
} from "lucide-react";
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
  const isCancelled = event.status === "Cancelled";

  return (
    <TableRow
      className="cursor-pointer border-border transition-colors"
      onClick={onViewDetails}
    >
      <TableCell className="border-border pl-6 font-medium">
        <div className="flex flex-col">
          <span>{event.title}</span>
          {event.description && (
            <span className="max-w-62.5 truncate text-xs text-muted-foreground">
              {event.description}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap border-border text-sm">
        {format(new Date(event.dateAndTime), "MMM d, yyyy • h:mm a")}
      </TableCell>
      <TableCell className="border-border text-sm">
        {event.capacity.toLocaleString()}
      </TableCell>
      <TableCell className="border-border">
        <Badge
          variant="secondary"
          className={`border ${statusColor[event.status] ?? "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"}`}
        >
          {event.status}
        </Badge>
      </TableCell>
      <TableCell className="border-border">
        <Badge
          variant="secondary"
          className={`border-0 ${approvalColor[event.approvalStatus] ?? "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400"}`}
        >
          {event.approvalStatus}
        </Badge>
      </TableCell>
      <TableCell
        className="border-border pr-6 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted">
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
              className={
                isCancelled
                  ? "text-green-600 focus:bg-green-500/10 focus:text-green-400 dark:focus:bg-green-500/10 dark:focus:text-green-400"
                  : "text-red-600 focus:bg-red-500/10 focus:text-red-400 dark:focus:bg-red-500/10 dark:focus:text-red-400"
              }
            >
              {isCancelled ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <BanIcon className="h-4 w-4" />
              )}
              {isCancelled ? "Publish Event" : "Cancel Event"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
