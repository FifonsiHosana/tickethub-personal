import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PaginationSect } from "@/components/shared/Pagination";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Loader2Icon, SearchIcon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import type { AdminEvent } from "@/utils/services/admin/events-admin.service";
import { format } from "date-fns";

interface Props {
  data: { data: AdminEvent[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } } | undefined;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onApprove: (eventId: number) => void;
  onReject: (eventId: number, reason: string) => void;
}

export function ApprovalQueueTable({ data, isLoading, page, onPageChange, onApprove, onReject }: Props) {
  const [approveEvent, setApproveEvent] = useState<AdminEvent | null>(null);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const filtered = events.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="space-y-3">
      <div className="relative w-72">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search pending events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <CheckCircleIcon className="h-10 w-10 text-green-300 mb-3" />
          <p className="text-muted-foreground text-sm">{search ? "No events match your search" : "No events pending approval."}</p>
        </div>
      ) : (
        <>
          <div className="rounded-md border max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.organizerFirstName ? `${event.organizerFirstName} ${event.organizerLastName}` : "—"}</TableCell>
                    <TableCell>{format(new Date(event.dateAndTime), "dd MMM yyyy HH:mm aa")}</TableCell>
                    <TableCell>{event.capacity.toLocaleString()}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button className="bg-green-500 text-white" variant="outline" size="sm" onClick={() => setApproveEvent(event)}>
                        <CheckCircleIcon className="h-3 w-3 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => setRejectId(event.id)}>
                        <XCircleIcon className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {pagination && (
            <PaginationSect page={page} currentPage={page} totalPages={pagination.totalPages} setPage={onPageChange} />
          )}
        </>
      )}
      <ConfirmDialog
        open={approveEvent !== null}
        onOpenChange={(o) => { if (!o) setApproveEvent(null); }}
        title="Approve Event"
        description={approveEvent ? `Publish "${approveEvent.title}"? It will be visible to attendees immediately.` : ""}
        confirmText="Approve"
        variant="default"
        onConfirm={() => {
          if (approveEvent) { onApprove(approveEvent.id); setApproveEvent(null); }
        }}
      />
      <Dialog open={rejectId !== null} onOpenChange={() => { setRejectId(null); setReason(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reject Event</DialogTitle></DialogHeader>
          <Input placeholder="Reason for rejection..." value={reason} onChange={(e) => setReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectId(null); setReason(""); }}>Cancel</Button>
            <Button variant="destructive" disabled={!reason.trim()} onClick={() => { if (rejectId) { onReject(rejectId, reason); setRejectId(null); setReason(""); } }}>
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
