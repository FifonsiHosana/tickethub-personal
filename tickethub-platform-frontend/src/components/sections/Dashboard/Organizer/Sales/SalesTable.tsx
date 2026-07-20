import { format } from "date-fns";
import { Loader2Icon, ReceiptTextIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type GetOrganizerSalesResponse } from "@/utils/services/organizers/sales.service";

interface SalesTableProps {
  sales: GetOrganizerSalesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const SalesTable = ({ sales, isLoading, isError }: SalesTableProps) => {
  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border rounded-xl bg-white">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-sans">
          Loading transactions...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-xl bg-white text-red-500">
        Failed to load sales data.
      </div>
    );
  }

  if (!sales?.data.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border rounded-xl bg-white text-center">
        <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
          <ReceiptTextIcon className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No transactions found
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Adjust your search or filters to see results.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden shadow-sm">
      <Table className="border border-gray-300">
        <TableHeader className="bg-neutral-50/80 border-b border-gray-200">
          <TableRow className="border-b border-gray-200">
            <TableHead>Customer</TableHead>
            <TableHead>Event & Ticket</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.data.map((sale) => (
            <TableRow
              key={sale.paymentId}
              className="hover:bg-neutral-50/50 border-b border-gray-200 transition-colors"
            >
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {sale.customerFirstName} {sale.customerLastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {sale.customerEmail}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-[#1a201c] line-clamp-1">
                    {sale.eventTitle}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {sale.quantity}x {sale.ticketName}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-neutral-600">
                {sale.purchasedAt
                  ? format(new Date(sale.purchasedAt), "MMM d, yyyy")
                  : "N/A"}
              </TableCell>
              <TableCell className="font-medium text-foreground">
                {sale.currency}{" "}
                {Number(sale.amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={
                    sale.paymentStatus === "Completed"
                      ? "bg-green-500/15 text-green-700 hover:bg-green-500/25"
                      : "bg-red-500/15 text-red-700 hover:bg-red-500/25"
                  }
                >
                  {sale.paymentStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
