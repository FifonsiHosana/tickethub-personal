import { Link } from "react-router"; // or "next/link" if using Next.js
import { format } from "date-fns"; // Standard for date formatting, or use native Intl.DateTimeFormat
import {
  PlusIcon,
  MoreHorizontalIcon,
  CalendarX2Icon,
  Loader2Icon,
  EyeIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";

import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Type definition based on your provided schema
export interface OrganizerEventResponse {
  id: number;
  title: string;
  description?: string;
  status: "Draft" | "Published" | "Completed" | "Cancelled";
  approvalStatus: "Pending" | "Approved" | "Rejected";
  capacity: number;
  dateAndTime: string;
  createdAt: string;
  updatedAt: string;
}

export default function EventsList() {
  const { data: events, isLoading, isError } = useOrganizerEvents();

  const getStatusColor = (status: OrganizerEventResponse["status"]) => {
    switch (status) {
      case "Published":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
      case "Draft":
        return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25";
      case "Completed":
        return "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25";
      case "Cancelled":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25";
      default:
        return "bg-gray-500/15 text-gray-700";
    }
  };

  const getApprovalColor = (
    status: OrganizerEventResponse["approvalStatus"]
  ) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/15 text-green-700 hover:bg-green-500/25";
      case "Pending":
        return "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25";
      case "Rejected":
        return "bg-red-500/15 text-red-700 hover:bg-red-500/25";
      default:
        return "bg-gray-500/15 text-gray-700";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Events</h2>
          <p className="text-muted-foreground mt-1">
            Manage your created events, track statuses, and view details.
          </p>
        </div>
        <Button className="p-3">
          <Link to="/organizer/events/new" className="flex items-center">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="px-6 py-4 border-b border-gray-200">
          <CardTitle className="text-lg">All Events</CardTitle>
          <CardDescription>
            A list of all your events across the platform.
          </CardDescription>
        </CardHeader>
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

          {/* No events */}
          {!isLoading && !isError && (!events || events.length === 0) && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                <CalendarX2Icon className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No events found</h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                You haven't created any events yet. Click the button below to
                get started.
              </p>
              <Button variant="outline">
                <Link to="/organizer/events/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Create Your First Event
                </Link>
              </Button>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && events && events.length > 0 && (
            <Table>
              <TableHeader className="border-b border-gray-200">
                <TableRow className="border-b border-gray-200">
                  <TableHead className="pl-6">Event Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Approval</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event: OrganizerEventResponse) => (
                  <TableRow
                    key={event.id}
                    className="cursor-pointer border-gray-200"
                  >
                    <TableCell className="pl-6 font-medium">
                      <div className="flex flex-col">
                        <span>{event.title}</span>
                        {event.description && (
                          <span className="text-xs text-muted-foreground truncate max-w-62.5">
                            {event.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {format(
                        new Date(event.dateAndTime),
                        "MMM d, yyyy • h:mm a"
                      )}
                    </TableCell>
                    <TableCell>{event.capacity.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`border ${getStatusColor(event.status)}`}
                      >
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`border-0 ${getApprovalColor(
                          event.approvalStatus
                        )}`}
                      >
                        {event.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white" align="end">
                          <DropdownMenuItem>
                            <Link
                              className="flex flex-row items-center gap-1"
                              to={`/organizer/events/${event.id}`}
                            >
                              <EyeIcon className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link
                              className="flex flex-row items-center gap-1"
                              to={`/organizer/events/${event.id}/edit`}
                            >
                              <EditIcon className="mr-2 h-4 w-4" /> Edit Event
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex flex-row items-center gap-1 text-foreground focus:bg-destructive/10 focus:text-red-500 cursor-pointer">
                            <TrashIcon className="mr-2 h-4 w-4" /> Delete Event
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
