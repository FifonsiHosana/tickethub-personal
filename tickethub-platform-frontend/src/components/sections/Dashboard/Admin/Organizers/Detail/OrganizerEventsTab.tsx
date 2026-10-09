import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationSect } from "@/components/shared/Pagination";
import type { PaginatedResponse, AdminOrganizerEvent } from "@/utils/services/admin/users.service";
import { dateTime, money } from "./format";

type Props = {
  data?: PaginatedResponse<AdminOrganizerEvent>;
  page: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

export function OrganizerEventsTab({ data, page, isLoading, onPageChange }: Props) {
  const events = data?.data ?? [];
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="rounded-md border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead><TableHead>Status</TableHead><TableHead>Approval</TableHead>
                <TableHead>Date</TableHead><TableHead>Capacity</TableHead><TableHead>Tickets</TableHead><TableHead>Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={7} className="py-8 text-center">Loading events...</TableCell></TableRow> : null}
              {!isLoading && events.length === 0 ? <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No events found.</TableCell></TableRow> : null}
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell><Badge variant="secondary">{event.status}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{event.approvalStatus}</Badge></TableCell>
                  <TableCell>{dateTime(event.dateAndTime)}</TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>{Number(event.ticketsSold ?? 0).toLocaleString()}</TableCell>
                  <TableCell>{money(event.grossSales)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {data?.pagination ? <PaginationSect page={page} currentPage={page} totalPages={data.pagination.totalPages} setPage={onPageChange} /> : null}
      </CardContent>
    </Card>
  );
}
