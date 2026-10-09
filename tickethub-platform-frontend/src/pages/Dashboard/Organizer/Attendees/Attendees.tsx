import { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendars, ScanIcon } from "lucide-react";
import { useDashboardEventFilter } from "@/components/shared/date/useDashboardEventFilter";
import AttendeesTable from "@/components/sections/Dashboard/Organizer/Attendees/AttendeesTable";
import ScannerDialog from "@/components/sections/Dashboard/Organizer/Attendees/ScannerDialog";
import { useEventAttendees } from "@/hooks/organizers/useOrganizerAttendees";

export default function Attendees() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { search: locationSearch, pathname } = useLocation();
  const { eventId, eventIdNumber } = useDashboardEventFilter();
  const [page, setPage] = useState(1);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setPage(1);
    setScannerOpen(false);
  }, [eventId]);

  useEffect(() => {
    const params = new URLSearchParams(locationSearch);
    if (params.get("openScanner") !== "1") return;

    if (eventIdNumber) setScannerOpen(true);
    params.delete("openScanner");
    const nextSearch = params.toString();
    navigate(`${pathname}${nextSearch ? `?${nextSearch}` : ""}`, { replace: true });
  }, [eventIdNumber, locationSearch, navigate, pathname]);

  const { data, isLoading } = useEventAttendees(eventIdNumber ?? null, {
    page,
    pageSize: 5,
    search,
  });

  const handleScanned = useCallback(() => {
    if (!eventIdNumber) return;
    queryClient.invalidateQueries({
      queryKey: ["organizer-event-attendees", eventIdNumber],
    });
  }, [queryClient, eventIdNumber]);

  return (
    <div className="flex-1 min-w-0 space-y-6 p-1">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Attendees
        </h2>
        <p className="text-muted-foreground mt-1 font-sans">
          View attendees and scan tickets for check-in.
        </p>
      </div>

      <div className="flex-1 min-w-0 space-y-3">
        {eventIdNumber && (
          <Button
            onClick={() => setScannerOpen(true)}
            className="w-full bg-primary text-white hover:bg-primary/60 sm:w-auto"
          >
            <ScanIcon className="h-4 w-4" />
            Start Scanner
          </Button>
        )}

        {!eventIdNumber && (
          <div className="flex flex-col bg-card text-center rounded border border-border items-center justify-center py-32">
            <Calendars className="h-10 w-10 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Kindly select an event</h3>
          </div>
        )}

        {eventIdNumber && (
          <div className="min-w-0 overflow-x-auto">
            <AttendeesTable
              eventId={eventIdNumber}
              data={data}
              isLoading={isLoading}
              page={page}
              onPageChange={setPage}
              search={search}
              onSearchChange={(val: string) => {
                setSearch(val);
                setPage(1);
              }}
            />
          </div>
        )}

        <ScannerDialog
          open={scannerOpen}
          onOpenChange={setScannerOpen}
          onScanned={handleScanned}
        />
      </div>
    </div>
  );
}
