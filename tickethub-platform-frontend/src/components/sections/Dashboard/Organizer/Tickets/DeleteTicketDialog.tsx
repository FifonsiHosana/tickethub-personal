import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useDeleteTicket } from "@/hooks/organizers/useOrganizerEventTickets";
import type { TicketResponse } from "@/utils/services/organizers/tickets.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket: TicketResponse | null;
}

export function DeleteTicketDialog({ open, onOpenChange, ticket }: Props) {
  const deleteMutation = useDeleteTicket();

  async function handleDelete() {
    if (!ticket) return;
    try {
      await deleteMutation.mutateAsync(ticket.id);
      toast.success("Ticket deleted");
      onOpenChange(false);
    } catch {
      toast.error("Ticket could not be deleted. It may have existing sales.");
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Ticket"
      description={`Delete "${ticket?.name}"? This cannot be undone. Tickets with existing sales cannot be deleted.`}
      cancelText="Keep Ticket"
      confirmText="Delete"
      variant="destructive"
      onConfirm={handleDelete}
    />
  );
}
