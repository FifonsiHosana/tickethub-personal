import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useEventTickets,
  useSwapIssuedTicket,
} from "@/hooks/organizers/useOrganizerEventTickets";

interface Props {
  eventId: number;
  ticketIdentifier: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SwapTicketDialog({
  eventId,
  ticketIdentifier,
  open,
  onOpenChange,
}: Props) {
  const [targetEventTicketId, setTargetEventTicketId] = useState("");
  const [reason, setReason] = useState("");
  const { data: tickets = [] } = useEventTickets(eventId);
  const swapMutation = useSwapIssuedTicket();
  const selectedTicket = tickets.find(
    (ticket) => String(ticket.eventTicketId) === targetEventTicketId,
  );
  const selectedTicketLabel = selectedTicket
    ? `${selectedTicket.ticketType ?? selectedTicket.name} - GH₵ ${Number(selectedTicket.price).toFixed(2)}`
    : undefined;

  const handleSwap = async () => {
    if (!targetEventTicketId) return;
    await swapMutation.mutateAsync({
      ticketIdentifier,
      targetEventTicketId: Number(targetEventTicketId),
      reason: reason || undefined,
    });
    setReason("");
    setTargetEventTicketId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Swap Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={targetEventTicketId} onValueChange={(value) => setTargetEventTicketId(value ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Select new ticket type">
                {selectedTicketLabel}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {tickets.map((ticket) => (
                <SelectItem
                  key={ticket.eventTicketId}
                  value={String(ticket.eventTicketId)}
                >
                  {ticket.ticketType ?? ticket.name} - GH₵ {Number(ticket.price).toFixed(2)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Reason, optional"
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSwap}
            disabled={!targetEventTicketId || swapMutation.isPending}
          >
            Swap
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
