import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderHistory } from "@/hooks/attendees/orders/useOrderHistory";
import { PaginationSect } from "@/components/shared/Pagination";
import OrderHistoryTable from "@/components/sections/Attendee/TicketOrderHistory/OrderHistoryTable";
import EmptyOrders from "@/components/sections/Attendee/TicketOrderHistory/EmptyOrders";

export default function TicketOrderHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: orderHistory, isLoading, isError } = useOrderHistory({
    page,
    pageSize,
  });

  const orders = orderHistory?.data ?? [];
  const pagination = orderHistory?.pagination;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-36 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Ticket Order History
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Review the tickets you have purchased and their check-in status.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          Unable to load your order history. Please try again later.
        </p>
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <OrderHistoryTable orders={orders} />
      )}

      {pagination && pagination.totalPages > 1 && (
        <PaginationSect
          page={page}
          currentPage={page}
          totalPages={pagination.totalPages}
          setPage={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}