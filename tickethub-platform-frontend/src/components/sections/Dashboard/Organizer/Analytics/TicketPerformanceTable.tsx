import { SearchIcon } from "lucide-react";
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
import { PaginationSect } from "@/components/shared/Pagination";
import { ExportDropdown } from "@/components/shared/ExportDropdown";
import type { TicketPerformanceItem } from "@/utils/services/organizers/analytics.service";
import type { PaginationMeta } from "@/utils/services/organizers/events.service";

interface TicketPerformanceTableProps {
  data: TicketPerformanceItem[] | undefined;
  isLoading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  pagination: PaginationMeta | undefined;
}

export const TicketPerformanceTable = ({
  data,
  isLoading,
  search,
  onSearchChange,
  page,
  onPageChange,
  pagination,
}: TicketPerformanceTableProps) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex lg:flex-row lg:items-center lg:justify-between flex-col items-start gap-2">
          <div>
            <CardTitle>Ticket Tier Analytics</CardTitle>
            <CardDescription>
              Breakdown of sales volume and revenue by ticket type
            </CardDescription>
          </div>
          <div className="flex flex-col items-start lg:flex-row lg:items-center gap-3">
            <div className="relative w-56">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm bg-card"
              />
            </div>
            <ExportDropdown
              data={(data ?? []) as unknown as Record<string, unknown>[]}
              columns={[
                { key: "ticketName", label: "Ticket Name" },
                { key: "eventName", label: "Event" },
                { key: "ticketsSold", label: "Ticket Orders" },
                { key: "revenue", label: "Generated Revenue" },
              ]}
              filename="ticket-tier-analytics"
              title="Ticket Tier Analytics"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <p className="text-muted-foreground">Loading ticket data...</p>
          </div>
        ) : !data?.length ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            {search ? "No tickets match your search." : "No ticket data available."}
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Ticket Name</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead className="text-right">Ticket Orders</TableHead>
                    <TableHead className="text-right">
                      Generated Revenue
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((ticket) => (
                    <TableRow
                      key={ticket.ticketId}
                      className="hover:bg-muted/50 border border-border"
                    >
                      <TableCell className="font-medium text-foreground border-border">
                        {ticket.ticketName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm border-border">
                        {ticket.eventName}
                      </TableCell>
                      <TableCell className="text-right font-medium border-border">
                        {ticket.ticketsSold.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-foreground font-semibold border-border">
                        GH₵ {ticket.revenue.toLocaleString()}
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
