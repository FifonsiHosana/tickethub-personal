import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendars, ScanIcon } from "lucide-react";
import EventSelectDropdown from "@/components/sections/Dashboard/Organizer/Shared/EventSelectDropdown";
import AttendeesTable from "@/components/sections/Dashboard/Organizer/Attendees/AttendeesTable";
import ScannerDialog from "@/components/sections/Dashboard/Organizer/Attendees/ScannerDialog";
import { useEventAttendees } from "@/hooks/organizers/useOrganizerAttendees";

export default function Attendees() {
  const queryClient = useQueryClient();
  const [eventId, setEventId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [scannerOpen, setScannerOpen] = useState(false);

  const { data, isLoading } = useEventAttendees(
    eventId ? Number(eventId) : null,
    { page, pageSize: 5 },
  );

  const handleScanned = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["organizer-event-attendees", Number(eventId)],
    });
  }, [queryClient, eventId]);

  return (
    <div className="flex-1 space-y-6 p-1">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Attendees
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          View attendees and scan tickets for check-in.
        </p>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <EventSelectDropdown
          value={eventId}
          onChange={(val) => {
            setEventId(val);
            setPage(1);
          }}
        />
        {eventId && (
          <Button
            onClick={() => setScannerOpen(true)}
            className="bg-primary text-white hover:bg-primary/60"
          >
            <ScanIcon className="h-4 w-4" />
            Start Scanner
          </Button>
        )}
      </div>

      {!eventId && (
        <div className="flex flex-col bg-white rounded border border-gray-300 items-center justify-center py-32 text-center">
          <Calendars className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold">Kindly select an event</h3>
        </div>
      )}

      {eventId && (
        <AttendeesTable
          data={data}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
        />
      )}

      <ScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScanned={handleScanned}
      />
    </div>
  );
}
