import { Link } from "react-router";
import { format } from "date-fns";
import {
  PlusIcon,
  MoreHorizontalIcon,
  CalendarX2Icon,
  Loader2Icon,
  EyeIcon,
  EditIcon,
  TrashIcon,
} from "lucide-react";

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

interface EventsTableProps {
  events: OrganizerEventResponse[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const EventsTable = ({
  events,
  isLoading,
  isError,
}: EventsTableProps) => {
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
    status: OrganizerEventResponse["approvalStatus"],
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
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">All Events</CardTitle>
            <CardDescription>
              A list of all your events across the platform.
            </CardDescription>
          </div>
          <Button className="h-8 px-3" size="sm">
            <Link to="/organizer/events/new" className="flex items-center">
              <PlusIcon className="mr-2 h-4 w-4" />
              New
            </Link>
          </Button>
        </div>
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
              You haven't created any events yet. Click the button below to get
              started.
            </p>
            <Button variant="outline">
              <Link to="/organizer/events/new" className="flex items-center">
                <PlusIcon className="mr-2 h-4 w-4" />
                Create Your First Event
              </Link>
            </Button>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && events && events.length > 0 && (
          <Table>
            <TableHeader className="border-b border-gray-200 bg-neutral-50/50">
              <TableRow className="border-b border-gray-200 hover:bg-transparent">
                <TableHead className="pl-6">Event Name</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow
                  key={event.id}
                  className="cursor-pointer border-gray-200 transition-colors"
                >
                  <TableCell className="pl-6 font-medium">
                    <div className="flex flex-col">
                      <span className="text-[#1a201c]">{event.title}</span>
                      {event.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-62.5">
                          {event.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-neutral-600">
                    {format(
                      new Date(event.dateAndTime),
                      "MMM d, yyyy • h:mm a",
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-neutral-600">
                    {event.capacity.toLocaleString()}
                  </TableCell>
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
                      className={`border-0 ${getApprovalColor(event.approvalStatus)}`}
                    >
                      {event.approvalStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
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
                      ></DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white" align="end">
                        <DropdownMenuItem>
                          <Link
                            className="flex flex-row items-center gap-2 cursor-pointer"
                            to={`/organizer/events/${event.id}`}
                          >
                            <EyeIcon className="h-4 w-4" /> View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link
                            className="flex flex-row items-center gap-2 cursor-pointer"
                            to={`/organizer/events/${event.id}/edit`}
                          >
                            <EditIcon className="h-4 w-4" /> Edit Event
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex flex-row items-center gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                          <TrashIcon className="h-4 w-4" /> Delete Event
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
  );
};
