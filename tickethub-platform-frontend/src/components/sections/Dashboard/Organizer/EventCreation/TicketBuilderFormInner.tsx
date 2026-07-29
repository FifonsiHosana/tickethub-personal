import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { TicketFormValues } from "@/types/organizer/event.schema";
import {
  useTicketTypes,
  useCreateTicketType,
} from "@/hooks/organizers/useOrganizerEventTickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { data: ticketTypes = [] } = useTicketTypes();
  const { mutateAsync: createType } = useCreateTicketType();
  const qc = useQueryClient();

  const [name, setName] = useState(editingTicket?.name ?? "");
  const [ticketTypeId, setTicketTypeId] = useState<number | null>(
    editingTicket?.ticketTypeId ?? null
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
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");

  function handleSave() {
    if (!name || !ticketTypeId || price <= 0) return;
    onSave({
      name,
      ticketTypeId,
      price,
      totalCount: qty,
      benefits: benefits || undefined,
      salesStartDate: salesStartDate || undefined,
      salesEndDate: salesEndDate || undefined,
    });
    resetForm();
  }

  function resetForm() {
    setName("");
    setTicketTypeId(null);
    setPrice(0);
    setQty(undefined);
    setBenefits("");
    setSalesStartDate("");
    setSalesEndDate("");
    if (editingTicket) onCancelEdit();
  }

  async function handleCreateType() {
    if (!newTypeName) return;
    const result = await createType({
      name: newTypeName,
      description: newTypeDesc || undefined,
    });
    qc.invalidateQueries({ queryKey: ["organizer-ticket-types"] });
    setTicketTypeId(result.id);
    setShowNewType(false);
    setNewTypeName("");
    setNewTypeDesc("");
    toast.success("Ticket type created");
  }

  const valid = name.length >= 3 && ticketTypeId !== null && price > 0;
  const types = ticketTypes as { id: number; name: string }[];

  const selectedTicketType = types.find((t) => t.id === ticketTypeId);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Ticket name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex gap-2 items-end">
        <div className="flex w-full">
          <Select
            value={ticketTypeId?.toString() ?? ""}
            onValueChange={(v) => setTicketTypeId(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type">
                {selectedTicketType ? selectedTicketType.name : "Select type"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-white">
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id.toString()}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowNewType(!showNewType)}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      {showNewType && (
        <div className="space-y-2 rounded-md border border-border p-3">
          <Input
            placeholder="Type name"
            value={newTypeName}
            onChange={(e) => setNewTypeName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={newTypeDesc}
            onChange={(e) => setNewTypeDesc(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleCreateType}
              disabled={!newTypeName}
            >
              Save Type
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowNewType(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

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
        placeholder="Benefits (optional)"
        value={benefits}
        onChange={(e) => setBenefits(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="datetime-local"
          value={salesStartDate}
          onChange={(e) => setSalesStartDate(e.target.value)}
          placeholder="Sales start"
        />
        <Input
          type="datetime-local"
          value={salesEndDate}
          onChange={(e) => setSalesEndDate(e.target.value)}
          placeholder="Sales end"
        />
      </div>

      <Button
        type="button"
        className="w-full"
        variant="secondary"
        onClick={handleSave}
        disabled={!valid}
      >
        {editingTicket ? "Update Ticket" : "Save Ticket"}
      </Button>
    </div>
  );
}
