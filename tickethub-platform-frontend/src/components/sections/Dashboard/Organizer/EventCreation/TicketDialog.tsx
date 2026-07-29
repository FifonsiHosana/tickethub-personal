import { useState } from "react";
import { Loader2 } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";
import type {
  CreateEventFormValues,
  TicketFormValues,
} from "@/types/organizer/event.schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { TicketBuilderForm } from "./TicketBuilderForm";
import { TicketList } from "./TicketList";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldArray: UseFieldArrayReturn<CreateEventFormValues, "tickets">;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function TicketDialog({
  open,
  onOpenChange,
  fieldArray: { fields, append, update, remove },
  onSubmit,
  isSubmitting,
}: Props) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const editingTicket =
    editIdx !== null
      ? (fields[editIdx] as unknown as TicketFormValues | undefined) ?? null
      : null;

  function handleSave(payload: TicketFormValues) {
    if (editIdx !== null) {
      update(editIdx, payload);
      setEditIdx(null);
    } else {
      append(payload);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editIdx !== null ? "Edit Ticket" : "Add Ticket"}
          </DialogTitle>
        </DialogHeader>
        <TicketBuilderForm
          editingTicket={editingTicket}
          onSave={handleSave}
          onCancelEdit={() => setEditIdx(null)}
        />
        <TicketList
          fields={fields}
          onEdit={(i) => setEditIdx(i)}
          onRemove={(i) => remove(i)}
        />
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || fields.length === 0}
          >
            {isSubmitting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
