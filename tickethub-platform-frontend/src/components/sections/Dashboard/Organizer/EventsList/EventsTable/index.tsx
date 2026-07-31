import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationSect } from "@/components/shared/Pagination";
import { CalendarX2Icon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";
import { EventsTableHeader } from "./EventsTableHeader";
import { EventsTableBody } from "./EventsTableBody";
import { EventDetailsSheet } from "./EventDetails/EventDetailsSheet";
import { EditEventDialog } from "./EditEventDialog";
import { CancelEventDialog } from "./CancelEventDialog";
import type { OrganizerEventResponse, PaginationMeta } from "@/utils/services/organizers/events.service";

interface Props {
  events: OrganizerEventResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  pagination: PaginationMeta | undefined;
}

export function EventsTable({ events, isLoading, isError, search, onSearchChange, page, onPageChange, pagination }: Props) {
  const [selected, setSelected] = useState<OrganizerEventResponse | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleView = (e: OrganizerEventResponse) => { setSelected(e); setSheetOpen(true); };
  const handleEdit = (e: OrganizerEventResponse) => { setSelected(e); setEditOpen(true); };
  const handleCancel = (e: OrganizerEventResponse) => { setSelected(e); setCancelOpen(true); };

  return (
    <Card>
      <EventsTableHeader search={search} onSearchChange={onSearchChange} events={events} />
      <CardContent className="p-0">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Loader2Icon className="h-8 w-8 animate-spin mb-4" />
            <p>Loading events...</p>
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-destructive">
            <p>Failed to load events. Please try refreshing the page.</p>
          </div>
        )}
        {!isLoading && !isError && (!events || events.length === 0) && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <CalendarX2Icon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No events found</h3>
            <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
              {search ? "No events match your search. Try adjusting your search terms." : "You haven't created any events yet."}
            </p>
            {!search && (
              <Button variant="outline">
                <Link to="/organizer/events/new" className="flex items-center">
                  <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Event
                </Link>
              </Button>
            )}
          </div>
        )}
        {!isLoading && !isError && events && events.length > 0 && (
          <>
            <EventsTableBody events={events} onViewDetails={handleView} onEdit={handleEdit} onCancel={handleCancel} />
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-300">
                <PaginationSect page={page} currentPage={page} totalPages={pagination.totalPages} setPage={onPageChange} />
              </div>
            )}
          </>
        )}
      </CardContent>
      <EventDetailsSheet open={sheetOpen} onOpenChange={setSheetOpen} eventId={selected?.id ?? null} />
      <EditEventDialog open={editOpen} onOpenChange={setEditOpen} event={selected} />
      <CancelEventDialog open={cancelOpen} onOpenChange={setCancelOpen} eventId={selected?.id ?? null} eventName={selected?.title ?? ""} />
    </Card>
  );
}
