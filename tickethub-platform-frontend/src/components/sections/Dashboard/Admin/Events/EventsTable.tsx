import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, SearchIcon } from "lucide-react";
import type { AdminEvent } from "@/utils/services/admin/events-admin.service";

interface Props {
  events: AdminEvent[];
  isLoading: boolean;
}

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Published: "default", Draft: "secondary", Completed: "outline", Cancelled: "destructive",
};
const approvalVariant: Record<string, "default" | "secondary" | "destructive"> = {
  Approved: "default", Pending: "secondary", Rejected: "destructive",
};

export function EventsTable({ events, isLoading }: Props) {
  const [search, setSearch] = useState("");
  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="rounded-md border max-h-120 overflow-auto">
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
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No events found</TableCell></TableRow>
            ) : (
              filtered.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.organizerFirstName ? `${event.organizerFirstName} ${event.organizerLastName}` : "—"}</TableCell>
                  <TableCell>{new Date(event.dateAndTime).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant={statusVariant[event.status] ?? "secondary"}>{event.status}</Badge></TableCell>
                  <TableCell><Badge variant={approvalVariant[event.approvalStatus ?? ""] ?? "secondary"}>{event.approvalStatus ?? "—"}</Badge></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
