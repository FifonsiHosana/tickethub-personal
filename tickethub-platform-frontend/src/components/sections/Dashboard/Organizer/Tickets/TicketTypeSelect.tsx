import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTicketTypes } from "@/hooks/organizers/useOrganizerEventTickets";
import { NewTicketTypeSection } from "./NewTicketTypeSection";

interface Props {
  value: number | null;
  onChange: (ticketTypeId: number) => void;
}

export function TicketTypeSelect({ value, onChange }: Props) {
  const { data: ticketTypes = [] } = useTicketTypes();
  const [showNewType, setShowNewType] = useState(false);
  const types = ticketTypes as { id: number; name: string }[];
  const selected = types.find((t) => t.id === value);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end">
        <div className="flex w-full">
          <Select
            value={value?.toString() ?? ""}
            onValueChange={(v) => v && onChange(Number(v))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type">
                {selected ? selected.name : "Select type"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
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
          aria-label="Create new ticket type"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
      {showNewType && (
        <NewTicketTypeSection
          onCreated={(id) => {
            onChange(id);
            setShowNewType(false);
          }}
        />
      )}
    </div>
  );
}
