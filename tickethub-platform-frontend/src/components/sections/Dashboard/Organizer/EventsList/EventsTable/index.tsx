import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { PaginationSect } from "@/components/shared/Pagination";
import {
  CalendarX2Icon,
  Loader2Icon,
  PlusIcon,
  CalendarIcon,
  MoreVerticalIcon,
  EyeIcon,
  PencilIcon,
  XCircleIcon,
  SearchIcon,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { EventsTableHeader } from "./EventsTableHeader";
import { EventDetailsSheet } from "./EventDetails/EventDetailsSheet";
import { CancelEventDialog } from "./CancelEventDialog";
import type {
  OrganizerEventResponse,
  PaginationMeta,
} from "@/utils/services/organizers/events.service";
import { statusColor } from "@/utils/statusColors";
import { Input } from "@/components/ui/input";
import { getEventPath } from "@/utils/routes/eventRoutes";

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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const navigate = useNavigate();

  const handleView = (e: OrganizerEventResponse) => {
    setSelected(e);
    setSheetOpen(true);
  };
  const handleEdit = (e: OrganizerEventResponse) => {
    navigate(`/organizer/events/${e.slug || e.id}/edit`);
  };
  const handleCancel = (e: OrganizerEventResponse) => {
    setSelected(e);
    setCancelOpen(true);
  };
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (window.scrollY > 100) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);

    // Cleanup function
    return () => {
      window.removeEventListener("scroll", checkScrollTop);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header Container */}
      <Button
        aria-label="Scroll to top"
        className={`fixed bottom-8 right-8 z-50 p-3 rounded-full bg-primary text-white shadow-lg shadow-primary/60 transition-all duration-300 ease-in-out hover:bg-primary/60 hover:shadow-xl hover:-translate-y-1 flex items-center justify-center ${
          showScroll
            ? "opacity-100 translate-y-0 cursor-pointer"
            : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <Link to="/organizer/events/new" className="flex items-center">
          <PlusIcon className="w-6 h-6" />
        </Link>
      </Button>
      <div className="flex justify-end items-end mt-5 gap-2">
        <div className="relative w-35">
          <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-8 text-sm bg-card"
          />
        </div>
        <Button className="h-8 px-3" size="lg">
          <Link to="/organizer/events/new" className="flex items-center">
            <PlusIcon className="mr-2 h-4 w-4" /> New Event
          </Link>
        </Button>
      </div>
      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 rounded-lg border bg-card text-card-foreground shadow-sm">
          <Loader2Icon className="h-8 w-8 animate-spin mb-4 text-primary" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-24 rounded-lg border bg-card text-destructive shadow-sm">
          <p>Failed to load events. Please try refreshing the page.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && (!events || events.length === 0) && (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-lg border bg-card shadow-sm">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <CalendarX2Icon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="mt-2 mb-6 max-w-sm text-muted-foreground">
            {search
              ? "No events match your search. Try adjusting your search terms."
              : "You haven't created any events yet."}
          </p>
          {!search && (
            <Button variant="default">
              <Link to="/organizer/events/new" className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Event
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Grid Content */}
      {!isLoading && !isError && events && events.length > 0 && (
        <>
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20`}
          >
            {events.map((event) => (
              <Card
                key={event.id}
                className="flex flex-col py-0 justify-between overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Event Image Banner (Optional - falls back if unavailable) */}

                <div className="relative h-48 rounded-lg m-2 overflow-hidden bg-muted">
                  <div className="absolute left-2 top-2 z-10">
                    <Badge
                      variant="secondary"
                      className={`border ${
                        statusColor[event.status] ??
                        "bg-gray-500 text-gray-700 dark:bg-gray-500 dark:text-gray-400 shadow"
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  {event.banner ? (
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                </div>

                <CardContent className="py-0 my-0 text-sm text-muted-foreground flex-1">
                  {/* <CardHeader className="flex items-start justify-between space-y-0 pb-2"> */}
                  <div className="flex justify-between">
                    <div className="pr-2">
                      <CardTitle className="  font-medium">
                        {event.title}
                      </CardTitle>
                    </div>

                    {/* Actions Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVerticalIcon className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(event)}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(event)}>
                          <PencilIcon className="mr-2 h-4 w-4" />
                          Edit Event
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCancel(event)}
                          className="text-destructive focus:text-destructive"
                        >
                          <XCircleIcon className="mr-2 h-4 w-4" />
                          Cancel Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {/* </CardHeader> */}
                  </div>

                  {event.status && (
                    <div className="flex justify-between">
                      {event.dateAndTime && (
                        <div className="flex text-xs items-center gap-2">
                          <CalendarIcon className="h-4 w-4 shrink-0" />
                          <span>
                            {new Date(event.dateAndTime).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="gap-2 border-0 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleView(event)}
                  >
                    View Details
                  </Button>

                  {event.status !== "Cancelled" && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Edit event"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Open public page"
                        onClick={() => navigate(getEventPath(event))}
                      >
                        <ExternalLink />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        aria-label="Cancel event"
                        onClick={() => handleCancel(event)}
                      >
                        <XCircleIcon />
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Section */}
          {pagination && pagination.totalPages > 1 && (
            <div className="pt-4 flex justify-center">
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

      {/* Dialogs & Sheets */}
      <EventDetailsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        eventId={selected?.id ?? null}
      />
      <CancelEventDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        eventId={selected?.id ?? null}
        eventName={selected?.title ?? ""}
      />
    </div>
  );
}


