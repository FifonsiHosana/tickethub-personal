import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PaginationSect } from "@/components/shared/Pagination";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { format } from "date-fns";
import type { AdminEvent } from "@/utils/services/admin/events-admin.service";

interface Props {
  data: { data: AdminEvent[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } } | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Published": return "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20";
    case "Draft": return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 dark:bg-slate-500/10 dark:text-slate-400 dark:hover:bg-slate-500/20";
    case "Completed": return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20";
    case "Cancelled": return "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20";
    default: return "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20";
  }
};

const getApprovalColor = (status: string | null) => {
  switch (status) {
    case "Approved": return "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20";
    case "Pending": return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20";
    case "Rejected": return "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20";
    default: return "bg-gray-500/15 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 dark:hover:bg-gray-500/20";
  }
};

export function EventsTable({ data, isLoading, page, onPageChange, search, onSearchChange }: Props) {
  const events = data?.data ?? [];
  const pagination = data?.pagination;

  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => { onSearchChange(e.target.value); }} />
      </div>
      <div className="rounded-md border border-border max-h-120 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Organizer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approval</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No events found</TableCell></TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.organizerFirstName ? `${event.organizerFirstName} ${event.organizerLastName}` : "—"}</TableCell>
                  <TableCell>{format(new Date(event.dateAndTime), "dd MMM yyyy HH:mm aa")}</TableCell>
                  <TableCell><Badge className={`border ${getStatusColor(event.status)}`}>{event.status}</Badge></TableCell>
                  <TableCell><Badge className={`border-0 ${getApprovalColor(event.approvalStatus)}`}>{event.approvalStatus ?? "—"}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <PaginationSect page={page} currentPage={page} totalPages={pagination.totalPages} setPage={onPageChange} />
      )}
    </div>
  );
}
