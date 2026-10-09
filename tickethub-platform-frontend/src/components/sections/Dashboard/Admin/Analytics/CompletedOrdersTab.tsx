import { useState } from "react";
import { DownloadIcon, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import { useCompletedOrders } from "@/hooks/admin/useAdminAnalytics";
import { useDashboardDateRange } from "@/components/shared/date/useDashboardDateRange";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportCompletedOrders } from "@/utils/services/admin/analytics.service";
import CompletedOrderRow from "./CompletedOrderRow";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function CompletedOrdersTab() {
  const { range } = useDashboardDateRange();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);
  const params = {
    page,
    pageSize: 10,
    search: search.trim() || undefined,
    from: range?.from ?? undefined,
    to: range?.to ?? undefined,
  };
  const { data, isLoading, isError, refetch } = useCompletedOrders(params);
  const pagination = data?.pagination;

  async function handleExport(format: "excel" | "pdf") {
    try {
      setExporting(format);
      const blob = await exportCompletedOrders({ ...params, format });
      downloadBlob(blob, `completed-orders.${format === "excel" ? "xlsx" : "pdf"}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setExporting(null);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Completed Orders</CardTitle>
          <p className="text-sm text-muted-foreground">Every completed platform order, newest first.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => handleExport("excel")} disabled={!!exporting}>
            <DownloadIcon /> {exporting === "excel" ? "Exporting..." : "Export Excel"}
          </Button>
          <Button variant="outline" onClick={() => handleExport("pdf")} disabled={!!exporting}>
            <DownloadIcon /> {exporting === "pdf" ? "Exporting..." : "Export PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search buyer, phone, order, reference, event, or organizer"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
          />
        </div>
        {isError ? (
          <div className="rounded-lg border border-destructive/30 p-4 text-sm">
            Could not load completed orders. <Button variant="link" onClick={() => refetch()}>Retry</Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead><TableHead>Buyer</TableHead><TableHead>Organizer</TableHead>
                  <TableHead>Events</TableHead><TableHead>Tickets</TableHead><TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead><TableHead>Payment</TableHead><TableHead>Paid At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? <TableRow><td className="p-4 text-sm text-muted-foreground" colSpan={9}>Loading completed orders...</td></TableRow> : null}
                {!isLoading && data?.data.length === 0 ? <TableRow><td className="p-4 text-center text-sm text-muted-foreground" colSpan={9}>No completed orders found.</td></TableRow> : null}
                {data?.data.map((order) => <CompletedOrderRow key={order.orderId} order={order} />)}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>{pagination ? `${pagination.total.toLocaleString()} orders` : ""}</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 1 || isLoading} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <span>Page {page} of {Math.max(1, pagination?.totalPages ?? 1)}</span>
            <Button variant="outline" disabled={page >= (pagination?.totalPages ?? 1) || isLoading} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
