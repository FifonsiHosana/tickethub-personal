import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  CalendarCheckIcon,
  CalendarIcon,
  CalendarX2Icon,
  CheckCircleIcon,
  Edit,
  ExternalLink,
  EyeIcon,
  Loader2Icon,
  MoreVerticalIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { PaginationSect } from "@/components/shared/Pagination";
import type {
  OrganizerEventResponse,
  PaginationMeta,
} from "@/utils/services/organizers/events.service";
import { getEventPath } from "@/utils/routes/eventRoutes";
import { statusColor } from "@/utils/statusColors";
import { CancelEventDialog } from "./CancelEventDialog";

type EventStatusAction = "cancel" | "publish";

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

export function OrganizerEventsGrid({
  events,
  isLoading,
  isError,
  search,
  onSearchChange,
  page,
  onPageChange,
  pagination,
}: Props) {
  const [selected, setSelected] = useState<OrganizerEventResponse | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventAction, setEventAction] = useState<EventStatusAction>("cancel");
  const [showScroll, setShowScroll] = useState(false);
  const navigate = useNavigate();

  const handleView = (event: OrganizerEventResponse) => {
    navigate(`/organizer/events/${event.slug || event.id}`);
  };

  const handleEdit = (event: OrganizerEventResponse) => {
    navigate(`/organizer/events/${event.slug || event.id}/edit`);
  };

  const handleStatusAction = (event: OrganizerEventResponse) => {
    setSelected(event);
    setEventAction(event.status === "Cancelled" ? "publish" : "cancel");
    setDialogOpen(true);
  };

  useEffect(() => {
    const checkScrollTop = () => setShowScroll(window.scrollY > 100);
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  return (
    <div className="space-y-6">
      <Button
        aria-label="Create event"
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center rounded-full bg-primary p-3 text-white shadow-lg shadow-primary/60 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-primary/60 hover:shadow-xl ${
          showScroll
            ? "translate-y-0 cursor-pointer opacity-100"
            : "pointer-events-none translate-y-10 opacity-0"
        }`}
      >
        <Link to="/organizer/events/new" className="flex items-center">
          <PlusIcon className="h-6 w-6" />
        </Link>
      </Button>

      <div className="mt-5 flex items-end justify-end gap-2">
        <div className="relative w-35">
          <SearchIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 bg-card pl-8 text-sm"
          />
        </div>
        <Button className="h-8 px-3" size="lg">
          <Link to="/organizer/events/new" className="flex items-center">
            <PlusIcon className="mr-2 h-4 w-4" /> New Event
          </Link>
        </Button>
      </div>

      {isLoading && <EventsLoadingState />}
      {isError && <EventsErrorState />}
      {!isLoading && !isError && (!events || events.length === 0) && (
        <EventsEmptyState hasSearch={!!search} />
      )}

      {!isLoading && !isError && events && events.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 pb-20 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onView={() => handleView(event)}
                onEdit={() => handleEdit(event)}
                onStatusAction={() => handleStatusAction(event)}
                onOpenPublic={() => navigate(getEventPath(event))}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <PaginationSect
                page={page}
                currentPage={page}
                totalPages={pagination.totalPages}
                setPage={onPageChange}
              />
            </div>
          )}
        </>
      )}

      <CancelEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        eventId={selected?.id ?? null}
        eventName={selected?.title ?? ""}
        action={eventAction}
      />
    </div>
  );
}

function EventCard({
  event,
  onView,
  onEdit,
  onStatusAction,
  onOpenPublic,
}: {
  event: OrganizerEventResponse;
  onView: () => void;
  onEdit: () => void;
  onStatusAction: () => void;
  onOpenPublic: () => void;
}) {
  const isCancelled = event.status === "Cancelled";

  return (
    <Card
      onClick={(ev) => {
        ev.stopPropagation();
        onView();
      }}
      className="flex cursor-pointer flex-col justify-between overflow-hidden py-0 transition-shadow hover:shadow-md"
    >
      <div className="relative m-2 h-48 overflow-hidden rounded-lg bg-muted">
        <div className="absolute left-2 top-2 z-10">
          <Badge
            variant="secondary"
            className={`border ${
              statusColor[event.status] ??
              "bg-gray-500 text-gray-700 shadow dark:bg-gray-500 dark:text-gray-400"
            }`}
          >
            {event.status}
          </Badge>
        </div>
        {event.banner ? (
          <img src={event.banner} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <CardContent className="my-0 flex-1 py-0 text-sm text-muted-foreground">
        <div className="flex justify-between">
          <CardTitle className="pr-2 font-medium">{event.title}</CardTitle>
          <EventActionsMenu
            isCancelled={isCancelled}
            onView={onView}
            onEdit={onEdit}
            onStatusAction={onStatusAction}
          />
        </div>
        {event.dateAndTime && (
          <div className="flex text-xs items-center gap-2">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span>{new Date(event.dateAndTime).toLocaleDateString()}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-0 pt-2">
        <Button variant="outline" className="flex-1" onClick={(ev) => { ev.stopPropagation(); onView(); }}>
          View Details
        </Button>
        {isCancelled ? (
          <Button variant="outline" size="icon" aria-label="Publish event" onClick={(ev) => { ev.stopPropagation(); onStatusAction(); }}>
            <CheckCircleIcon />
          </Button>
        ) : (
          <>
            <Button variant="outline" size="icon" aria-label="Edit event" onClick={(ev) => { ev.stopPropagation(); onEdit(); }}>
              <Edit />
            </Button>
            <Button variant="outline" size="icon" aria-label="Open public page" onClick={(ev) => { ev.stopPropagation(); onOpenPublic(); }}>
              <ExternalLink />
            </Button>
            <Button variant="destructive" size="icon" aria-label="Cancel event" onClick={(ev) => { ev.stopPropagation(); onStatusAction(); }}>
              <XCircleIcon />
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}

function EventActionsMenu({
  isCancelled,
  onView,
  onEdit,
  onStatusAction,
}: {
  isCancelled: boolean;
  onView: () => void;
  onEdit: () => void;
  onStatusAction: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={(ev) => ev.stopPropagation()}>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVerticalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(ev) => ev.stopPropagation()}>
        <DropdownMenuItem onClick={onView}><EyeIcon className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit}><PencilIcon className="mr-2 h-4 w-4" />Edit Event</DropdownMenuItem>
        <DropdownMenuItem
          onClick={onStatusAction}
          className={isCancelled ? "" : "text-destructive focus:text-destructive"}
        >
          {isCancelled ? <CheckCircleIcon className="mr-2 h-4 w-4" /> : <XCircleIcon className="mr-2 h-4 w-4" />}
          {isCancelled ? "Publish Event" : "Cancel Event"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EventsLoadingState() {
  return <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-card-foreground shadow-sm"><Loader2Icon className="mb-4 h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground">Loading events...</p></div>;
}

function EventsErrorState() {
  return <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-destructive shadow-sm"><p>Failed to load events. Please try refreshing the page.</p></div>;
}

function EventsEmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-24 text-center shadow-sm">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted"><CalendarX2Icon className="h-10 w-10 text-muted-foreground" /></div>
      <h3 className="text-lg font-semibold">No events found</h3>
      <p className="mb-6 mt-2 max-w-sm text-muted-foreground">{hasSearch ? "No events match your search. Try adjusting your search terms." : "You haven't created any events yet."}</p>
      {!hasSearch && <Button><Link to="/organizer/events/new" className="flex items-center"><CalendarCheckIcon className="mr-2 h-4 w-4" />Create Your First Event</Link></Button>}
    </div>
  );
}
