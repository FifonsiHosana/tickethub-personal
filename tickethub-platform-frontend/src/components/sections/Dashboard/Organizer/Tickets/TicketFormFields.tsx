import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketTypeSelect } from "./TicketTypeSelect";
import type {
  CreateTicketPayload,
  TicketResponse,
  UpdateTicketPayload,
} from "@/utils/services/organizers/tickets.service";
import { Label } from "@/components/ui/label";

interface Props {
  ticket: TicketResponse | null;
  onSaveAdd: (payload: CreateTicketPayload) => Promise<void>;
  onSaveEdit: (payload: UpdateTicketPayload) => Promise<void>;
}

function toLocalInput(iso: string | null) {
  return iso ? iso.slice(0, 16) : "";
}

function toIsoString(local: string) {
  return new Date(local).toISOString();
}

export function TicketFormFields({ ticket, onSaveAdd, onSaveEdit }: Props) {
  const editing = !!ticket;
  const [name, setName] = useState(ticket?.name ?? "");
  const [ticketTypeId, setTicketTypeId] = useState<number | null>(
    ticket?.ticketTypeId ?? null
  );
  const [price, setPrice] = useState(ticket ? Number(ticket.price) : 0);
  const [qty, setQty] = useState<number | undefined>(ticket?.totalCount);
  const [benefits, setBenefits] = useState(ticket?.benefits ?? "");
  const [salesStartDate, setSalesStartDate] = useState(
    toLocalInput(ticket?.salesStartDate ?? null)
  );
  const [salesEndDate, setSalesEndDate] = useState(
    toLocalInput(ticket?.salesEndDate ?? null)
  );
  const [saving, setSaving] = useState(false);

  const valid =
    name.trim().length >= 3 && price > 0 && (editing || ticketTypeId !== null);

  async function handleSave() {
    setSaving(true);
    try {
      if (ticket) {
        await onSaveEdit({
          name: name.trim(),
          price,
          ...(qty ? { totalCount: qty } : {}),
          ...(benefits.trim() ? { benefits: benefits.trim() } : {}),
          ...(salesStartDate
            ? { salesStartDate: toIsoString(salesStartDate) }
            : {}),
          ...(salesEndDate ? { salesEndDate: toIsoString(salesEndDate) } : {}),
        });
      } else {
        await onSaveAdd({
          name: name.trim(),
          ticketTypeId: ticketTypeId!,
          price,
          ...(qty ? { totalCount: qty } : {}),
          ...(benefits.trim() ? { benefits: benefits.trim() } : {}),
          ...(salesStartDate
            ? { salesStartDate: toIsoString(salesStartDate) }
            : {}),
          ...(salesEndDate ? { salesEndDate: toIsoString(salesEndDate) } : {}),
        });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-3">
      <Input
        placeholder="Ticket name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {!editing && (
        <TicketTypeSelect value={ticketTypeId} onChange={setTicketTypeId} />
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Price (GHS)"
          value={price || ""}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
        <Input
          type="number"
          min="1"
          placeholder="Quantity"
          value={qty ?? ""}
          onChange={(e) =>
            setQty(e.target.value ? Number(e.target.value) : undefined)
          }
        />
      </div>
      <Input
        placeholder="Benefits (optional)"
        value={benefits}
        onChange={(e) => setBenefits(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Sales start</Label>
          <Input
            type="datetime-local"
            placeholder="Sales start"
            value={salesStartDate}
            onChange={(e) => setSalesStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label>Sales end</Label>
          <Input
            type="datetime-local"
            placeholder="Sales end"
            value={salesEndDate}
            onChange={(e) => setSalesEndDate(e.target.value)}
          />
        </div>
      </div>
      <Button
        type="button"
        className="w-full"
        variant="secondary"
        onClick={handleSave}
        disabled={!valid || saving}
      >
        {saving ? "Saving..." : editing ? "Update Ticket" : "Save Ticket"}
      </Button>
    </div>
  );
}
