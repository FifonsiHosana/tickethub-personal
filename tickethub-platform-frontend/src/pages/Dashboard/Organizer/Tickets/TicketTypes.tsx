import { useState } from "react";
import { PlusIcon, TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventSelectDropdown from "@/components/sections/Dashboard/Organizer/Shared/EventSelectDropdown";
import TicketTypesTable from "@/components/sections/Dashboard/Organizer/Tickets/TicketTypesTable";
import { TicketFormDialog } from "@/components/sections/Dashboard/Organizer/Tickets/TicketFormDialog";
import { DeleteTicketDialog } from "@/components/sections/Dashboard/Organizer/Tickets/DeleteTicketDialog";
import { useEventTickets } from "@/hooks/organizers/useOrganizerEventTickets";
import type { TicketResponse } from "@/utils/services/organizers/tickets.service";

export default function TicketTypes() {
  const [eventId, setEventId] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketResponse | null>(null);
  const [deletingTicket, setDeletingTicket] = useState<TicketResponse | null>(null);

  const numericEventId = eventId ? Number(eventId) : null;
  const { data: tickets, isLoading } = useEventTickets(numericEventId);

  return (
    <div className="flex-1 space-y-6 p-1">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Ticket Types
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          Manage and add tickets for your events.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <EventSelectDropdown value={eventId} onChange={setEventId} />
        {eventId && (
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-primary text-white hover:bg-primary/60"
          >
            <PlusIcon className="h-4 w-4" />
            Add Ticket
          </Button>
        )}
      </div>

      {!eventId && (
        <div className="flex flex-col bg-card text-center rounded border border-border items-center justify-center py-32">
          <TicketIcon className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Kindly select an event</h3>
        </div>
      )}

      {eventId && (
        <div className="grid">
          <TicketTypesTable
          tickets={tickets}
          isLoading={isLoading}
          onEdit={setEditingTicket}
          onDelete={setDeletingTicket}
        />
        </div>
      )}

      <TicketFormDialog
        open={addOpen || !!editingTicket}
        onOpenChange={(open) => {
          if (!open) {
            setAddOpen(false);
            setEditingTicket(null);
          }
        }}
        eventId={numericEventId ?? 0}
        ticket={editingTicket}
      />
      <DeleteTicketDialog
        open={!!deletingTicket}
        onOpenChange={(open) => {
          if (!open) setDeletingTicket(null);
        }}
        ticket={deletingTicket}
      />
    </div>
  );
}
