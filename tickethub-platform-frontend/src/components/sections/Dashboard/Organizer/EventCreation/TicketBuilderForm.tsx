import {
  TicketBuilderFormInner,
  type TicketBuilderFormProps,
} from "./TicketBuilderFormInner";

export function TicketBuilderForm({
  editingTicket,
  onSave,
  onCancelEdit,
}: TicketBuilderFormProps) {
  const key = editingTicket
    ? `edit-${editingTicket.ticketTypeId}-${editingTicket.name}`
    : "new";

  return (
    <TicketBuilderFormInner
      key={key}
      editingTicket={editingTicket}
      onSave={onSave}
      onCancelEdit={onCancelEdit}
    />
  );
}
