import { useState } from "react";
import { format } from "date-fns";
import {
  Loader2Icon,
  MoreHorizontalIcon,
  PlusIcon,
  CalendarIcon,
  TicketIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";
import {
  useEventTickets,
  useCreateEventTicket,
  useUpdateTicket,
  useDeleteTicket,
} from "@/hooks/organizers/useOrganizerEventTickets";
import { TicketConfigSheet } from "@/components/sections/Dashboard/Organizer/Tickets/TicketConfigSheet";
import type { TicketResponse } from "@/utils/services/organizers/tickets.service";
// import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";

const PAGE_SIZE = 10;

export default function TicketTypes() {
  const { data: eventsResponse } = useOrganizerEvents({ pageSize: 999 });
  const events = eventsResponse?.data ?? [];

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const eventId = selectedEventId ? Number(selectedEventId) : null;
  const selectedEvent = events.find((e) => e.id === eventId) ?? null;

  const { data: allTickets, isLoading } = useEventTickets(eventId);
  const createMutation = useCreateEventTicket(eventId ?? 0);
  const updateMutation = useUpdateTicket();
  const deleteMutation = useDeleteTicket();

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"create" | "edit">("create");
  const [editingTicket, setEditingTicket] = useState<TicketResponse | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<TicketResponse | null>(null);

  // Filter and paginate
  const filtered = (allTickets ?? []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.ticketType ?? "").toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const openCreateSheet = () => {
    setSheetMode("create");
    setEditingTicket(null);
    setSheetOpen(true);
  };

  const openEditSheet = (ticket: TicketResponse) => {
    setSheetMode("edit");
    setEditingTicket(ticket);
    setSheetOpen(true);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    if (sheetMode === "create") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await createMutation.mutateAsync(data as any);
    } else if (editingTicket) {
      await updateMutation.mutateAsync({
        ticketId: editingTicket.id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: data as any,
      });
    }
  };

  const handleDelete = async (ticket: TicketResponse) => {
    if (ticket.totalSold > 0) {
      window.alert(
        `This ticket has ${ticket.totalSold} sale${ticket.totalSold !== 1 ? "s" : ""} and cannot be deleted.`,
      );
      return;
    }
    setDeleteTarget(ticket);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } catch {
      // error handled by mutation
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-neutral-50/30 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
            Ticket Types
          </h2>
          <p className="text-muted-foreground mt-1 font-sans">
            Manage your ticket tiers and configurations.
          </p>
        </div>
      </div>

      {/* Event Selector */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEventId}
            onValueChange={(val) => {
              setSelectedEventId(val as string);
              setPage(1);
              setSearch("");
            }}
          >
            <SelectTrigger className="w-full sm:w-96 bg-white">
              <SelectValue placeholder="Choose an event to manage its tickets..." />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {events.map((ev) => (
                <SelectItem key={ev.id} value={ev.id.toString()}>
                  {ev.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <>
          {/* Event Summary */}
          <Card>
            <CardContent className="flex items-center gap-6 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                {format(new Date(selectedEvent.dateAndTime), "MMM d, yyyy")}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TicketIcon className="h-4 w-4" />
                Capacity: {selectedEvent.capacity.toLocaleString()}
              </div>
              <Badge
                variant="secondary"
                className={
                  selectedEvent.status === "Published"
                    ? "bg-green-500/15 text-green-700"
                    : selectedEvent.status === "Draft"
                      ? "bg-slate-500/15 text-slate-700"
                      : "bg-blue-500/15 text-blue-700"
                }
              >
                {selectedEvent.status}
              </Badge>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-gray-300">
              <div>
                <CardTitle className="text-lg">Tickets</CardTitle>
                <CardDescription>
                  Configure ticket tiers, pricing, and availability.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-56">
                  <Input
                    placeholder="Search tickets..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="h-8 text-sm bg-white pl-3"
                  />
                </div>
                <Button
                  className="h-8 px-3"
                  size="sm"
                  onClick={openCreateSheet}
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <Loader2Icon className="h-8 w-8 animate-spin mb-4" />
                  <p>Loading tickets...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <TicketIcon className="h-10 w-10 text-muted-foreground mb-3" />
                  <h3 className="text-lg font-semibold">
                    {allTickets?.length === 0
                      ? "No tickets configured"
                      : "No tickets match your search"}
                  </h3>
                  <p className="text-muted-foreground mt-1 mb-6 max-w-sm">
                    {allTickets?.length === 0
                      ? "Click the button above to add your first ticket tier."
                      : "Try adjusting your search terms."}
                  </p>
                  {allTickets?.length === 0 && (
                    <Button variant="outline" onClick={openCreateSheet}>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Your First Ticket
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader className="border-b border-gray-300 bg-neutral-50/50">
                      <TableRow className="border-b border-gray-300 hover:bg-transparent">
                        <TableHead className="pl-6">Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Sold</TableHead>
                        <TableHead className="text-right">Remaining</TableHead>
                        <TableHead className="text-right pr-6">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((ticket) => (
                        <TableRow
                          key={ticket.id}
                          className="border-gray-300 transition-colors"
                        >
                          <TableCell className="pl-6 font-medium text-[#1a201c] border-gray-300">
                            {ticket.name}
                          </TableCell>
                          <TableCell className="text-sm text-neutral-600 border-gray-300">
                            {ticket.ticketType ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-medium border-gray-300">
                            GH₵ {Number(ticket.price).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right border-gray-300">
                            {ticket.totalCount.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right border-gray-300">
                            {ticket.totalSold.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right border-gray-300">
                            <span
                              className={
                                ticket.remaining <= 0
                                  ? "text-red-600 font-medium"
                                  : ticket.remaining <= ticket.totalCount * 0.1
                                    ? "text-amber-600 font-medium"
                                    : ""
                              }
                            >
                              {ticket.remaining.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-right pr-6 border-gray-300">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-neutral-100"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontalIcon className="h-4 w-4 text-neutral-500" />
                                  </Button>
                                }
                              />
                              <DropdownMenuContent
                                className="bg-white"
                                align="end"
                              >
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer"
                                  onClick={() => openEditSheet(ticket)}
                                >
                                  <EditIcon className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                                  onClick={() => handleDelete(ticket)}
                                >
                                  <TrashIcon className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-300">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                        {" ("}
                        {filtered.length} ticket
                        {filtered.length !== 1 ? "s" : ""}
                        {")"}
                      </p>
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setPage(Math.max(1, page - 1))}
                              className={
                                page <= 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((p) => (
                            <PaginationItem key={p}>
                              <Button
                                variant={
                                  p === currentPage ? "outline" : "ghost"
                                }
                                size="icon"
                                className="h-8 w-8 text-sm"
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </Button>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setPage(page + 1)}
                              className={
                                page >= totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedEvent && eventId === null && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TicketIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold">Select an event</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              Choose an event from the dropdown above to manage its ticket
              configurations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteTarget?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Config Sheet */}
      <TicketConfigSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        mode={sheetMode}
        event={selectedEvent}
        ticket={editingTicket}
        onSave={handleSave}
      />
    </div>
  );
}
