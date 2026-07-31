import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTicketType } from "@/hooks/organizers/useOrganizerEventTickets";
import { toast } from "sonner";

interface Props {
  onCreated: (ticketTypeId: number) => void;
}

export function NewTicketTypeSection({ onCreated }: Props) {
  const { mutateAsync: createType, isPending } = useCreateTicketType();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      const result = await createType({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      toast.success("Ticket type created");
      onCreated(result.id);
    } catch {
      toast.error("Failed to create ticket type");
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <Input
        placeholder="Type name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Button
        type="button"
        size="sm"
        onClick={handleCreate}
        disabled={!name.trim() || isPending}
      >
        <PlusIcon className="h-4 w-4 mr-1" />
        Save Type
      </Button>
    </div>
  );
}
