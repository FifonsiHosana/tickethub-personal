import { format } from "date-fns";
import {
  Loader2Icon,
  MoreHorizontalIcon,
  TicketIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TicketResponse } from "@/utils/services/organizers/tickets.service";

interface Props {
  tickets: TicketResponse[] | undefined;
  isLoading: boolean;
  onEdit: (ticket: TicketResponse) => void;
  onDelete: (ticket: TicketResponse) => void;
}

function formatDate(dateStr: string | null) {
  return dateStr ? format(new Date(dateStr), "MMM d, yyyy") : "—";
}

export default function TicketTypesTable({
  tickets,
  isLoading,
  onEdit,
  onDelete,
}: Props) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-xl bg-white">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border rounded-xl bg-white text-center">
        <TicketIcon className="h-10 w-10 text-neutral-300 mb-3" />
        <h3 className="text-lg font-semibold text-foreground">No tickets yet</h3>
        <p className="text-muted-foreground text-sm mt-1">
          Add tickets for this event to start selling.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-300 overflow-hidden bg-white">
      <Table>
        <TableHeader className="bg-neutral-50">
          <TableRow>
            <TableHead>Ticket</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Available</TableHead>
            <TableHead>Sales Window</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-sm text-[#1a201c]">
                    {t.name}
                  </span>
                  {t.benefits && (
                    <span className="text-xs text-muted-foreground truncate max-w-48">
                      {t.benefits}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                <Badge
                  variant="secondary"
                  className="bg-neutral-100 text-neutral-600"
                >
                  {t.ticketType ?? "—"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm font-medium">
                GH₵ {Number(t.price).toFixed(2)}
              </TableCell>
              <TableCell className="text-sm text-neutral-600">
                {t.remaining.toLocaleString()} / {t.totalCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(t.salesStartDate)} – {formatDate(t.salesEndDate)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-neutral-100"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontalIcon className="h-4 w-4 text-neutral-500" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent className="bg-white" align="end">
                    <DropdownMenuItem onClick={() => onEdit(t)}>
                      Edit Ticket
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(t)}
                      className="text-red-600 focus:bg-red-50 focus:text-red-700"
                    >
                      Delete Ticket
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
