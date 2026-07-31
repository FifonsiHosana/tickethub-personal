import { ShoppingCartIcon } from "lucide-react";
import type { DashboardDataResponse } from "@/utils/services/organizers/dashboard.service";
import { format } from "date-fns";

type Sales = DashboardDataResponse["recentSales"];

interface Props {
  sales: Sales;
}

export default function RecentSalesTab({ sales }: Props) {
  if (!sales.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingCartIcon className="h-10 w-10 text-neutral-300 mb-3" />
        <p className="text-muted-foreground text-sm">No recent sales.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sales.map((sale) => (
        <div
          key={sale.orderId}
          className="flex items-center justify-between border-b pb-2 last:border-0"
        >
          <div>
            <p className="text-sm font-medium">Order #{sale.orderId}</p>
            <p className="text-xs text-muted-foreground">
               {format(new Date(sale.purchasedAt), "MMM d, yyyy • h:mm a")}
            </p>
          </div>
          <span
            className={`text-xs font-medium px-2 py-1 rounded ${
              sale.status === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {sale.status}
          </span>
        </div>
      ))}
    </div>
  );
}
