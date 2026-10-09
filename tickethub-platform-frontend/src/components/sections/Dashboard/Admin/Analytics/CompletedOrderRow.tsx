import type { CompletedOrder } from "@/utils/services/admin/analytics.service";
import { TableCell, TableRow } from "@/components/ui/table";

function formatMoney(value: number, currency: string) {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function CompletedOrderRow({ order }: { order: CompletedOrder }) {
  return (
    <TableRow>
      <TableCell className="font-medium">#{order.orderId}</TableCell>
      <TableCell>
        <div className="font-medium">{order.buyerName}</div>
        <div className="text-xs text-muted-foreground">{order.buyerEmail}</div>
        <div className="text-xs text-muted-foreground">{order.buyerPhone}</div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{order.organizerName}</div>
        <div className="text-xs text-muted-foreground">{order.organizerEmail}</div>
      </TableCell>
      <TableCell className="max-w-64 truncate" title={order.eventSummary}>
        {order.eventSummary || "-"}
      </TableCell>
      <TableCell>{order.ticketCount}</TableCell>
      <TableCell>{formatMoney(order.amount, order.currency)}</TableCell>
      <TableCell>{formatMoney(order.feeAmount, order.currency)}</TableCell>
      <TableCell>
        <div className="capitalize">{order.provider}</div>
        <div className="font-mono text-xs text-muted-foreground">{order.reference}</div>
      </TableCell>
      <TableCell>{formatDate(order.paidAt)}</TableCell>
    </TableRow>
  );
}
