import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useOrderHistory, useOrderHistoryDetail } from "@/hooks/attendees/orders/useOrderHistory";
import { PaginationSect } from "@/components/shared/Pagination";
import OrderHistoryList from "@/components/sections/Attendee/TicketOrderHistory/OrderHistoryList";
import EmptyOrders from "@/components/sections/Attendee/TicketOrderHistory/EmptyOrders";
import OrderDetailPanel from "@/components/sections/Attendee/TicketOrderHistory/OrderDetailPanel";
import { cn } from "@/lib/utils";

const periods = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const;

type Period = (typeof periods)[number]["value"];

export default function TicketOrderHistoryPage() {
  const { orderId } = useParams<{ orderId?: string }>();
  const selectedOrderId = orderId ? Number(orderId) : undefined;
  const [period, setPeriod] = useState<Period>("upcoming");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const history = useOrderHistory({ page, pageSize, period });
  const detail = useOrderHistoryDetail(selectedOrderId);
  const orders = history.data?.data ?? [];
  const pagination = history.data?.pagination;
  const selectedOrder = useMemo(
    () => detail.data ?? orders.find((order) => order.orderId === selectedOrderId) ?? orders[0] ?? null,
    [detail.data, orders, selectedOrderId],
  );

  useEffect(() => setPage(1), [period]);

  return (
    <div className="flex-1 min-w-0 w-full px-4 py-6 sm:px-6">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Ticket Order History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Open any completed order to view your tickets.</p>
        </div>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1 sm:w-64">
          {periods.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={period === item.value ? "default" : "ghost"}
              onClick={() => setPeriod(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {history.data?.fromCache && (
        <p className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
          Showing the last loaded orders. Reconnect and retry for fresh tickets.
        </p>
      )}

      {history.isLoading ? (
        <HistorySkeleton />
      ) : history.isError ? (
        <ErrorState onRetry={() => void history.refetch()} />
      ) : orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]">
          <div className={cn(selectedOrderId && "hidden lg:block")}>
            <OrderHistoryList orders={orders} selectedOrderId={selectedOrder?.orderId} />
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4">
                <PaginationSect
                  page={page}
                  currentPage={page}
                  totalPages={pagination.totalPages}
                  setPage={setPage}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </div>
          <div className={cn(!selectedOrderId && "hidden lg:block")}>
            {detail.isLoading && selectedOrderId ? <DetailSkeleton /> : <OrderDetailPanel order={selectedOrder} showBack={!!selectedOrderId} />}
            {detail.isError && selectedOrderId && <ErrorState onRetry={() => void detail.refetch()} />}
          </div>
        </div>
      )}
    </div>
  );
}

function HistorySkeleton() {
  return <div className="grid gap-4 lg:grid-cols-[minmax(320px,420px)_1fr]"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="hidden h-96 rounded-2xl lg:block" /></div>;
}

function DetailSkeleton() {
  return <Skeleton className="h-96 rounded-2xl" />;
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="rounded-2xl border border-border bg-card p-6 text-center"><p className="text-sm text-muted-foreground">Unable to load orders. Please try again.</p><Button className="mt-4" onClick={onRetry}>Retry</Button></div>;
}
