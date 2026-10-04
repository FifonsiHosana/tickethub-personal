import { PencilIcon, Trash2Icon } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";
import type { CreateEventFormValues } from "@/types/organizer/event.schema";
import { Button } from "@/components/ui/button";

type Field = UseFieldArrayReturn<
  CreateEventFormValues,
  "tickets"
>["fields"][number];

interface Props {
  fields: Field[];
  onEdit?: (index: number) => void;
  onRemove?: (index: number) => void;
}

function ticketLabel(ticket: Field, index: number) {
  return ticket.ticketTypeName?.trim() || `Ticket type ${index + 1}`;
}

export function TicketList({ fields, onEdit, onRemove }: Props) {
  if (fields.length === 0) return null;

  return (
    <div className="space-y-1.5 max-h-32 overflow-y-auto border-t border-border pt-3">
      {fields.map((t, i) => (
        <div
          key={t.id}
          className="flex items-center justify-between rounded-md border border-border px-3 py-1.5 text-sm"
        >
          <span className="font-medium truncate min-w-0">{ticketLabel(t, i)}</span>
          <span className="text-muted-foreground shrink-0">
            GHS {Number(t.price).toFixed(2)}
          </span>
          {t.totalCount && (
            <span className="text-muted-foreground shrink-0 ml-1">
              x{t.totalCount}
            </span>
          )}
          {(onEdit || onRemove) && (
            <div className="flex shrink-0 ml-1">
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onEdit(i)}
                >
                  <PencilIcon className="h-3 w-3" />
                </Button>
              )}
              {onRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => onRemove(i)}
                >
                  <Trash2Icon className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
