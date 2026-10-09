import { useMemo } from "react";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PaginationSect } from "@/components/shared/Pagination";
import { exportToCsv } from "@/utils/exportUtils";
import type { AdminOrganizerOrder, PaginatedResponse } from "@/utils/services/admin/users.service";
import { buyerName, dateTime, money } from "./format";

type Props = {
  data?: PaginatedResponse<AdminOrganizerOrder>;
  exportData?: PaginatedResponse<AdminOrganizerOrder>;
  page: number;
  search: string;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
};

export function OrganizerOrdersTab({ data, exportData, page, search, isLoading, onPageChange, onSearchChange }: Props) {
  const orders = data?.data ?? [];
  const csvRows = useMemo(() => (exportData?.data ?? orders).map((order) => ({
    orderId: order.orderId,
    buyerName: buyerName(order.customerFirstName, order.customerLastName),
    buyerEmail: order.customerEmail,
    buyerPhone: order.phoneNumber ?? "",
    events: order.events ?? "",
    ticketCount: order.totalTickets,
    grossAmount: order.amount ?? "",
    feeAmount: order.feeAmount ?? "",
    reference: order.reference ?? "",
    provider: order.provider ?? "",
    paidDate: order.paidAt ?? "",
    status: order.status,
  })), [exportData, orders]);
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search by buyer name, email, or phone" value={search} onChange={(event) => onSearchChange(event.target.value)} />
          </div>
          <Button variant="outline" onClick={() => exportToCsv(csvRows, "organizer-orders") } disabled={!csvRows.length}>
            <DownloadIcon className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
        <div className="rounded-md border overflow-auto">
          <Table><TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Buyer</TableHead><TableHead>Events</TableHead><TableHead>Tickets</TableHead><TableHead>Amount</TableHead><TableHead>Fee</TableHead><TableHead>Reference</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoading ? <TableRow><TableCell colSpan={9} className="py-8 text-center">Loading orders...</TableCell></TableRow> : null}
              {!isLoading && orders.length === 0 ? <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No orders found.</TableCell></TableRow> : null}
              {orders.map((order) => <TableRow key={order.orderId}><TableCell>#{order.orderId}</TableCell><TableCell>{buyerName(order.customerFirstName, order.customerLastName)}<div className="text-xs text-muted-foreground">{order.customerEmail}</div></TableCell><TableCell>{order.events || "-"}</TableCell><TableCell>{order.totalTickets}</TableCell><TableCell>{money(order.amount)}</TableCell><TableCell>{money(order.feeAmount)}</TableCell><TableCell>{order.reference || "-"}</TableCell><TableCell>{dateTime(order.paidAt ?? order.purchasedAt)}</TableCell><TableCell>{order.status}</TableCell></TableRow>)}
            </TableBody></Table>
        </div>
        {data?.pagination ? <PaginationSect page={page} currentPage={page} totalPages={data.pagination.totalPages} setPage={onPageChange} /> : null}
      </CardContent>
    </Card>
  );
}
