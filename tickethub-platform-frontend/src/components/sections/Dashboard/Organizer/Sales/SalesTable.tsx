import { useState } from "react";
import { format } from "date-fns";
import { ChevronRightIcon, Loader2Icon, ReceiptTextIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SaleDetailsSheet } from "./SaleDetailsSheet";
import {
  type GetOrganizerSalesResponse,
  type OrganizerSaleRow,
} from "@/utils/services/organizers/sales.service";

interface SalesTableProps {
  sales: GetOrganizerSalesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export const SalesTable = ({ sales, isLoading, isError }: SalesTableProps) => {
  const [selectedSale, setSelectedSale] = useState<OrganizerSaleRow | null>(
    null,
  );

  if (isLoading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border rounded-xl bg-card">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-sans">
          Loading transactions...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full h-64 flex items-center justify-center border rounded-xl bg-card text-red-500">
        Failed to load sales data.
      </div>
    );
  }

  if (!sales?.data.length) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center border rounded-xl bg-card text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ReceiptTextIcon className="h-8 w-8 text-muted-foreground" />
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
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table className="border border-border">
          <TableHeader className="bg-muted/50 border-b border-border">
            <TableRow className="border-b border-border">
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.data.map((sale) => (
              <TableRow
                key={sale.paymentId}
                onClick={() => setSelectedSale(sale)}
                className="cursor-pointer hover:bg-muted/50 border-b border-border transition-colors"
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
                <TableCell className="text-sm text-muted-foreground">
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
                        ? "bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20"
                        : "bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
                    }
                  >
                    {sale.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <SaleDetailsSheet
        sale={selectedSale}
        open={selectedSale !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSale(null);
        }}
      />
    </>
  );
};