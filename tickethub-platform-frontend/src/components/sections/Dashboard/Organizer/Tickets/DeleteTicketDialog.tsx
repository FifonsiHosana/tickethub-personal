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

  const ExistingSales =
    (ticket?.remaining as number) < (ticket?.totalCount as number);

  const deleteDescription = ExistingSales
    ? "Tickets with existing sales cannot be deleted."
    : `Delete "${ticket?.name}"? This cannot be undone.`;

  const deleteTitle = ExistingSales ? "Action Impossible" : "Delete Ticket";

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
      title={deleteTitle}
      description={deleteDescription}
      cancelText={ExistingSales ? "Close" : "Keep Ticket"}
      confirmText={"Delete"}
      variant={"destructive"}
      dialogHasCancel={false}
      onConfirm={handleDelete}
    />
  );
}
