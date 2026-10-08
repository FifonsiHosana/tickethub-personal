import { useState } from "react";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import type { UseFieldArrayReturn } from "react-hook-form";
import { toast } from "sonner";
import type {
  EditEventFormValues,
  TicketFormValues,
} from "@/types/organizer/event.schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  fieldArray: UseFieldArrayReturn<EditEventFormValues, "tickets", "fieldId">;
  onDeleteExisting: (ticketId: number) => void;
}

const blankTicket: TicketFormValues = {
  ticketTypeName: "",
  price: 1,
  totalCount: 1,
  benefits: "",
  isVisible: true,
};

function label(ticket: TicketFormValues, index: number) {
  return ticket.ticketTypeName?.trim() || `Ticket type ${index + 1}`;
}

export function EditTicketsSection({ fieldArray, onDeleteExisting }: Props) {
  const { fields, append, update, remove } = fieldArray;
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<TicketFormValues>(blankTicket);

  function openEditor(index?: number) {
    setEditingIndex(index ?? null);
    setDraft(index === undefined ? { ...blankTicket } : (fields[index] as TicketFormValues));
    setEditorOpen(true);
  }

  function saveDraft() {
    const clean = {
      ...draft,
      ticketTypeName: draft.ticketTypeName.trim(),
      price: Number(draft.price),
      totalCount: draft.totalCount ? Number(draft.totalCount) : undefined,
      benefits: draft.benefits?.trim() || undefined,
      isVisible: draft.isVisible ?? true,
    };
    if (!clean.ticketTypeName) return toast.error("Ticket type is required.");
    if (editingIndex === null) append(clean);
    else update(editingIndex, clean);
    setEditingIndex(null);
    setEditorOpen(false);
  }

  function removeTicket(index: number) {
    const ticket = fields[index] as TicketFormValues;
    if (ticket.id && Number(ticket.totalSold ?? 0) > 0) {
      toast.error("Ticket types with sales cannot be deleted. Hide it instead.");
      return;
    }
    if (ticket.id) onDeleteExisting(ticket.id);
    remove(index);
  }

  function toggleVisible(index: number) {
    const ticket = fields[index] as TicketFormValues;
    update(index, { ...ticket, isVisible: !(ticket.isVisible ?? true) });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base">Tickets ({fields.length})</CardTitle>
        <Button type="button" size="sm" onClick={() => openEditor()}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.length === 0 && <p className="text-sm text-muted-foreground">Add at least one ticket type.</p>}
        {fields.map((ticket, index) => {
          const typed = ticket as TicketFormValues;
          const visible = typed.isVisible ?? true;
          return (
            <div key={ticket.fieldId} className="rounded-md border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{label(typed, index)}</p>
                  <p className="text-muted-foreground">GHS {Number(typed.price).toFixed(2)} · {typed.totalSold ?? 0} sold · {typed.remaining ?? typed.totalCount ?? 0} left</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => toggleVisible(index)} title={visible ? "Hide" : "Show"}>{visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => openEditor(index)}><Pencil className="h-4 w-4" /></Button>
                  <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => removeTicket(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              {typed.benefits && <p className="mt-2 line-clamp-2 text-muted-foreground">{typed.benefits}</p>}
              {!visible && <p className="mt-2 text-xs font-medium text-amber-600">Hidden from public checkout</p>}
            </div>
          );
        })}
      </CardContent>
      <Dialog open={editorOpen} onOpenChange={(open) => { setEditorOpen(open); if (!open) setEditingIndex(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingIndex === null ? "Add ticket type" : "Edit ticket type"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <Label>Ticket type<Input value={draft.ticketTypeName} onChange={(e) => setDraft({ ...draft, ticketTypeName: e.target.value })} /></Label>
            <div className="grid grid-cols-2 gap-3"><Label>Price<Input type="number" min="0" step="0.01" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} /></Label><Label>Quantity<Input type="number" min={draft.totalSold ?? 1} value={draft.totalCount ?? ""} onChange={(e) => setDraft({ ...draft, totalCount: Number(e.target.value) })} /></Label></div>
            <div className="grid grid-cols-2 gap-3"><Label>Sales start<Input type="datetime-local" value={draft.salesStartDate ?? ""} onChange={(e) => setDraft({ ...draft, salesStartDate: e.target.value })} /></Label><Label>Sales end<Input type="datetime-local" value={draft.salesEndDate ?? ""} onChange={(e) => setDraft({ ...draft, salesEndDate: e.target.value })} /></Label></div>
            <Label>Description/Benefits<Textarea value={draft.benefits ?? ""} onChange={(e) => setDraft({ ...draft, benefits: e.target.value })} /></Label>
          </div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="button" onClick={saveDraft}>Save ticket</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}