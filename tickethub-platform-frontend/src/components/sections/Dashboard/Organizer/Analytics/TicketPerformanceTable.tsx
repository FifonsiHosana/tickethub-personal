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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ticket Tier Analytics</CardTitle>
            <CardDescription>
              Breakdown of sales volume and revenue by ticket type
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-56">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-8 h-8 text-sm bg-white"
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
            <div className="rounded-xl border border-gray-300 overflow-hidden">
              <Table>
                <TableHeader className="bg-neutral-50/80">
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
                      className="hover:bg-neutral-50/50 border border-gray-300"
                    >
                      <TableCell className="font-medium text-[#1a201c] border-gray-300">
                        {ticket.ticketName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm border-gray-300">
                        {ticket.eventName}
                      </TableCell>
                      <TableCell className="text-right font-medium border-gray-300">
                        {ticket.ticketsSold.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-[#1a201c] font-semibold border-gray-300">
                        GH₵ {ticket.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                  {" ("}{pagination.total} ticket type{pagination.total !== 1 ? "s" : ""}{")"}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1,
                    ).map((p) => (
                      <PaginationItem key={p}>
                        <Button
                          variant={p === page ? "outline" : "ghost"}
                          size="icon"
                          className="h-8 w-8 text-sm"
                          onClick={() => onPageChange(p)}
                        >
                          {p}
                        </Button>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => onPageChange(page + 1)}
                        className={
                          page >= pagination.totalPages
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
  );
};
