import { Loader2Icon, UsersIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaginationSect } from "@/components/shared/Pagination";
import type { GetAttendeesResponse } from "@/utils/services/organizers/attendees.service";
import { format } from "date-fns";

interface Props {
  data: GetAttendeesResponse | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return format(new Date(dateStr), "MMM d, yyyy • h:mm a");
}

export default function AttendeesTable({
  data,
  isLoading,
  page,
  onPageChange,
}: Props) {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-xl bg-card">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border rounded-xl bg-card text-center">
        <UsersIcon className="h-10 w-10 text-muted-foreground mb-3" />
        <h3 className="text-lg font-semibold text-foreground">
          No attendees yet
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Attendees will appear here once tickets are purchased.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Attendee</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Checked In</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((a) => (
              <TableRow key={a.ticketIdentifier}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {a.firstName} {a.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {a.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{a.ticketType}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {a.ticketIdentifier}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={
                      a.checkedIn
                        ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                        : "bg-neutral-500/15 text-neutral-700 hover:bg-neutral-500/25 dark:bg-neutral-500/10 dark:text-neutral-400 dark:hover:bg-neutral-500/20"
                    }
                  >
                    {a.checkedIn ? "Checked In" : "Unused"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDateTime(a.checkedInAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationSect
        page={page}
        currentPage={page}
        totalPages={data.pagination.totalPages}
        setPage={onPageChange}
      />
    </div>
  );
}
