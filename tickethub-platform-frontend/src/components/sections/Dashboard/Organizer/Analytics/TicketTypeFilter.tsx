import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2Icon } from "lucide-react";
import { useTicketPerformance } from "@/hooks/organizers/useOrganizerAnalytics";
import { useEventTickets } from "@/hooks/organizers/useOrganizerEventTickets";

interface Props {
  value: string;
  onChange: (ticketId: string) => void;
  eventId?: number;
}

export default function TicketTypeFilter({ value, onChange, eventId }: Props) {
  const { data: allTickets, isLoading: allLoading } = useTicketPerformance({
    pageSize: 100,
  });
  const { data: eventTickets, isLoading: eventLoading } = useEventTickets(
    eventId ?? null,
  );

  const isLoading = eventId ? eventLoading : allLoading;

  const options = eventId
    ? (eventTickets ?? []).map((ticket) => ({
        ticketId: ticket.id,
        ticketName: ticket.name,
        eventName: "",
      }))
    : [...new Map(
        (allTickets?.data ?? []).map((ticket) => [
          ticket.ticketId,
          { ticketName: ticket.ticketName, eventName: ticket.eventName },
        ]),
      ).entries()].map(([ticketId, ticket]) => ({
        ticketId,
        ticketName: ticket.ticketName,
        eventName: ticket.eventName,
      }));

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        Loading ticket types...
      </div>
    );
  }

  const selectedLabel = options.find(
    (option) => String(option.ticketId) === value,
  )?.ticketName;

  return (
    <Select value={value} onValueChange={(val) => onChange(val as string)}>
      <SelectTrigger
        className="w-full md:w-75"
        aria-label="Filter by ticket type"
      >
        <SelectValue placeholder="All ticket types">
          {value ? selectedLabel ?? "All ticket types" : "All ticket types"}
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        <SelectItem value="">All ticket types</SelectItem>
        {options.map((option) => (
          <SelectItem
            key={option.ticketId}
            value={String(option.ticketId)}
          >
            {option.ticketName}
            {option.eventName ? ` · ${option.eventName}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}