import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  useCreateEventTicket,
  useUpdateTicket,
} from "@/hooks/organizers/useOrganizerEventTickets";
import { TicketFormFields } from "./TicketFormFields";
import type {
  CreateTicketPayload,
  TicketResponse,
  UpdateTicketPayload,
} from "@/utils/services/organizers/tickets.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number;
  ticket: TicketResponse | null;
}

export function TicketFormDialog({ open, onOpenChange, eventId, ticket }: Props) {
  const createMutation = useCreateEventTicket(eventId);
  const updateMutation = useUpdateTicket();
  const editing = !!ticket;

  async function handleAdd(payload: CreateTicketPayload) {
    try {
      await createMutation.mutateAsync(payload);
      toast.success("Ticket added successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to add ticket");
    }
  }

  async function handleEdit(payload: UpdateTicketPayload) {
    if (!ticket) return;
    try {
      await updateMutation.mutateAsync({ ticketId: ticket.id, payload });
      toast.success("Ticket updated successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update ticket");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Ticket" : "Add Ticket"}</DialogTitle>
        </DialogHeader>
        <TicketFormFields
          key={ticket?.id ?? "new"}
          ticket={ticket}
          onSaveAdd={handleAdd}
          onSaveEdit={handleEdit}
        />
      </DialogContent>
    </Dialog>
  );
}
