import { Table, TableBody as TBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EventTableRow } from "./EventTableRow";
import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";

interface Props {
  events: OrganizerEventResponse[];
  onViewDetails: (event: OrganizerEventResponse) => void;
  onEdit: (event: OrganizerEventResponse) => void;
  onCancel: (event: OrganizerEventResponse) => void;
}

export function EventsTableBody({ events, onViewDetails, onEdit, onCancel }: Props) {
  return (
    <Table>
      <TableHeader className="border-b border-gray-300 bg-neutral-50/50">
        <TableRow className="border-b border-gray-300 hover:bg-transparent">
          <TableHead className="pl-6">Event Name</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Approval</TableHead>
          <TableHead className="text-right pr-6">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TBody>
        {events.map((event) => (
          <EventTableRow
            key={event.id}
            event={event}
            onViewDetails={() => onViewDetails(event)}
            onEdit={() => onEdit(event)}
            onCancel={() => onCancel(event)}
          />
        ))}
      </TBody>
    </Table>
  );
}
