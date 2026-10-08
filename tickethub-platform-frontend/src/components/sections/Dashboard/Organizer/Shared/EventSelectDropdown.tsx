import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2Icon } from "lucide-react";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";

interface Props {
  value: string;
  onChange: (eventId: string) => void;
}

export default function EventSelectDropdown({ value, onChange }: Props) {
  const { data, isLoading } = useOrganizerEvents({ pageSize: 100 });
  const events = data?.data ?? [];

  useEffect(() => {
    if (!value && events.length > 0) {
      onChange(String(events[0].id));
    }
  }, [events, onChange, value]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Loading events...
      </div>
    );
  }

  const selectedEvent = events.find((event) => String(event.id) === value);

  return (
    <Select  value={value} onValueChange={(val) => val && onChange(val)}>
      <SelectTrigger className="w-full md:w-75" aria-label="Select an event">
        <SelectValue placeholder="Select an event...">
          {selectedEvent ? selectedEvent.title : "Select an event"}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {events.map((event) => (
          <SelectItem key={event.id} value={String(event.id)}>
            {event.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
