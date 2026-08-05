import { Loader2Icon, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { PaginationSect } from "@/components/shared/Pagination";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import type { EventPerformanceItem } from "@/utils/services/organizers/analytics.service";
import type { PaginationMeta } from "@/utils/services/organizers/events.service";

interface EventPerformanceTableProps {
  data: EventPerformanceItem[] | undefined;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  pagination: PaginationMeta | undefined;
}

export const EventPerformanceTable = ({
  data,
  isLoading,
  search,
  onSearchChange,
  page,
  onPageChange,
  pagination,
}: EventPerformanceTableProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Event Occupancy & Revenue</CardTitle>
            <CardDescription>
              Track the health and fill rate of your individual events
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm bg-card"
              />
            </div>
            <ExportDropdown
              data={(data ?? []) as unknown as Record<string, unknown>[]}
              columns={[
                { key: "eventName", label: "Event Name" },
                { key: "capacity", label: "Capacity" },
                { key: "ticketsSold", label: "Tickets Sold" },
                { key: "occupancyRate", label: "Occupancy Rate (%)" },
                { key: "revenue", label: "Revenue" },
              ]}
              filename="event-occupancy-revenue"
              title="Event Occupancy & Revenue"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data?.length ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            {search
              ? "No events match your search."
              : "No event data available."}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table className="border border-border">
                <TableHeader className="bg-muted/50">
                  <TableRow className="border border-border">
                    <TableHead>Event Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Tickets Sold</TableHead>
                    <TableHead className="w-50">Occupancy</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((event) => (
                    <TableRow
                      key={event.eventId}
                      className="hover:bg-muted/50 border border-border"
                    >
                      <TableCell className="font-medium text-foreground border-border">
                        {event.eventName}
                      </TableCell>
                      <TableCell className="text-muted-foreground border-border">
                        {event.capacity.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium border-border">
                        {event.ticketsSold.toLocaleString()}
                      </TableCell>
                      <TableCell className="border-border">
                        <div className="flex items-center gap-3">
                          <Progress
                            value={event.occupancyRate}
                            className="h-2 bg-muted"
                          />
                          <span className="text-xs font-medium text-muted-foreground w-12">
                            {event.occupancyRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-foreground font-semibold border-border">
                        GH₵ {event.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <PaginationSect page={page} currentPage={page} totalPages={pagination.totalPages} setPage={onPageChange} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
