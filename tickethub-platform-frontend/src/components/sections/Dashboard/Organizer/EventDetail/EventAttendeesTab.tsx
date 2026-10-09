import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ScanIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import AttendeesTable from "@/components/sections/Dashboard/Organizer/Attendees/AttendeesTable";
import ScannerDialog from "@/components/sections/Dashboard/Organizer/Attendees/ScannerDialog";
import { useEventAttendees } from "@/hooks/organizers/useOrganizerAttendees";

interface Props {
  eventId: number;
}

export function EventAttendeesTab({ eventId }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const { data, isLoading } = useEventAttendees(eventId, { page, pageSize: 5, search });

  const handleScanned = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["organizer-event-attendees", eventId] });
  }, [eventId, queryClient]);

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Attendees</h2>
          <p className="text-sm text-muted-foreground">Guest list and ticket scanning for this event.</p>
        </div>
        <Button onClick={() => setScannerOpen(true)} className="w-full sm:w-auto">
          <ScanIcon className="mr-1 h-4 w-4" />
          Start Scanner
        </Button>
      </div>
      <div className="min-w-0 overflow-x-auto">
        <AttendeesTable
          eventId={eventId}
          data={data}
          isLoading={isLoading}
          page={page}
          onPageChange={setPage}
          search={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
        />
      </div>
      <ScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScanned={handleScanned} />
    </div>
  );
}
