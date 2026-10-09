import { useState } from "react";
import type { TicketFormValues } from "@/types/organizer/event.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface TicketBuilderFormProps {
  editingTicket: TicketFormValues | null;
  onSave: (payload: TicketFormValues) => void;
  onCancelEdit: () => void;
}

export function TicketBuilderFormInner({
  editingTicket,
  onSave,
  onCancelEdit,
}: TicketBuilderFormProps) {
  const [ticketTypeName, setTicketTypeName] = useState(
    editingTicket?.ticketTypeName ?? "",
  );
  const [price, setPrice] = useState(editingTicket?.price ?? 0);
  const [qty, setQty] = useState<number | undefined>(editingTicket?.totalCount);
  const [benefits, setBenefits] = useState(editingTicket?.benefits ?? "");
  const [salesStartDate, setSalesStartDate] = useState(
    editingTicket?.salesStartDate ?? "",
  );
  const [salesEndDate, setSalesEndDate] = useState(
    editingTicket?.salesEndDate ?? "",
  );

  function handleSave() {
    const typeName = ticketTypeName.trim();
    if (!typeName || price <= 0) return;
    onSave({
      ticketTypeName: typeName,
      price,
      totalCount: qty,
      benefits: benefits || undefined,
      salesStartDate: salesStartDate || undefined,
      salesEndDate: salesEndDate || undefined,
    });
    resetForm();
  }

  function resetForm() {
    setTicketTypeName("");
    setPrice(0);
    setQty(undefined);
    setBenefits("");
    setSalesStartDate("");
    setSalesEndDate("");
    if (editingTicket) onCancelEdit();
  }

  const valid = ticketTypeName.trim().length >= 2 && price > 0;

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>Ticket type</Label>
        <Input
          placeholder="Ticket type"
          value={ticketTypeName}
          onChange={(e) => setTicketTypeName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          placeholder="Price"
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
        placeholder="Description/Benefits"
        value={benefits}
        onChange={(e) => setBenefits(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Sales Start</Label>
          <Input
            type="datetime-local"
            value={salesStartDate}
            onChange={(e) => setSalesStartDate(e.target.value)}
            placeholder="Sales start"
          />
        </div>
        <div className="space-y-1">
          <Label>Sales End</Label>
          <Input
            type="datetime-local"
            value={salesEndDate}
            onChange={(e) => setSalesEndDate(e.target.value)}
            placeholder="Sales end"
          />
        </div>
      </div>

      <Button
        type="button"
        className="w-full"
        variant="outline"
        onClick={handleSave}
        disabled={!valid}
      >
        {editingTicket ? "Update Ticket" : "Save Ticket"}
      </Button>
    </div>
  );
}
