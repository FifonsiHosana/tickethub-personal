import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react";
import type { AdminEvent } from "@/utils/services/admin/events-admin.service";

interface Props {
  events: AdminEvent[];
  isLoading: boolean;
  onApprove: (eventId: number) => void;
  onReject: (eventId: number, reason: string) => void;
}

export function ApprovalQueueTable({ events, isLoading, onApprove, onReject }: Props) {
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [reason, setReason] = useState("");

  if (isLoading) return <div className="flex justify-center py-8"><Loader2Icon className="h-6 w-6 animate-spin" /></div>;

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <CheckCircleIcon className="h-10 w-10 text-green-300 mb-3" />
        <p className="text-muted-foreground text-sm">No events pending approval.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border max-h-120 overflow-auto">
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
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>{event.organizerFirstName ? `${event.organizerFirstName} ${event.organizerLastName}` : "—"}</TableCell>
                <TableCell>{new Date(event.dateAndTime).toLocaleDateString()}</TableCell>
                <TableCell>{event.capacity.toLocaleString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button size="sm" onClick={() => onApprove(event.id)}>
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
    </>
  );
}
