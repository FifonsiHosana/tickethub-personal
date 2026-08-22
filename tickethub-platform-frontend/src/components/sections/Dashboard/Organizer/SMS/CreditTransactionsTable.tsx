import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCreditTransactions } from "@/hooks/organizers/useOrganizerSms";
import {
    deriveStatus,
    formatDate,
    STATUS_CONFIG,
    type CreditTransactionRecord,
} from "@/lib/sms";
import { cn } from "@/lib/utils";
import { AlertCircle, Receipt, RefreshCw } from "lucide-react";
import React, { useMemo, useState } from "react";

const PREVIEW_COUNT = 5;

// Skeleton rows for loading state
const TableSkeleton: React.FC = () => (
  <TableBody>
    {Array.from({ length: 4 }).map((_, i) => (
      <TableRow key={i}>
        {Array.from({ length: 5 }).map((_, j) => (
          <TableCell key={j} className="px-6 py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);

const EmptyState: React.FC = () => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={5} className="px-6 py-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-3 text-muted-foreground">
          <Receipt className="size-8 opacity-40" />
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs opacity-70">
            Your credit purchase history will appear here.
          </p>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={5} className="px-6 py-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-3 text-muted-foreground">
          <AlertCircle className="size-8 text-rose-400 opacity-70" />
          <p className="text-sm font-medium">Failed to load transactions</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-xs"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            Try again
          </Button>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
);

// Transaction row component
const TransactionRow: React.FC<{ tx: CreditTransactionRecord }> = React.memo(
  ({ tx }) => {
    const status = deriveStatus(tx);
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.completed;
    const creditsNum = Number(tx.credits) || 0;

    return (
      <TableRow className="transition-colors hover:bg-accent/40">
        <TableCell className="px-6 py-4 text-muted-foreground">
          {formatDate(tx.createdAt)}
        </TableCell>
        <TableCell className="px-6 py-4">
          <span
            title={tx.reference}
            className="inline-block max-w-[160px] truncate font-mono text-xs text-muted-foreground"
          >
            {tx.reference}
          </span>
        </TableCell>
        <TableCell className="px-6 py-4 font-medium tabular-nums text-emerald-700">
          +{creditsNum.toLocaleString()}
        </TableCell>
        <TableCell className="px-6 py-4 capitalize text-foreground">
          {tx.type}
        </TableCell>
        <TableCell className="px-6 py-4">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              cfg.className,
            )}
          >
            {cfg.icon}
            {cfg.label}
          </span>
        </TableCell>
      </TableRow>
    );
  },
);

TransactionRow.displayName = "TransactionRow";

export const CreditTransactionsTable: React.FC = () => {
  const {
    data: transactions = [],
    isLoading,
    isError,
    refetch,
  } = useCreditTransactions();
  const [showAll, setShowAll] = useState(false);

  const visibleTransactions = useMemo(() => {
    return showAll ? transactions : transactions.slice(0, PREVIEW_COUNT);
  }, [showAll, transactions]);

  const hasMore = transactions.length > PREVIEW_COUNT;

  // Wrapper for refetch to match onClick signature
  const handleRefetch = () => {
    refetch();
  };

  return (
    <div className="rounded-2xl border border-border">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">
            Credit Transaction History
          </h3>
          {transactions.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {transactions.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefetch}
            disabled={isLoading}
            aria-label="Refresh transactions"
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
          </Button>

          {hasMore && !isLoading && !isError && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll ? "Show less" : "View all"}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <TableHead className="px-6 py-3 font-medium">Date</TableHead>
              <TableHead className="px-6 py-3 font-medium">Reference</TableHead>
              <TableHead className="px-6 py-3 font-medium">Credits</TableHead>
              <TableHead className="px-6 py-3 font-medium">Type</TableHead>
              <TableHead className="px-6 py-3 font-medium">Status</TableHead>
            </TableRow>
          </TableHeader>

          {isLoading && <TableSkeleton />}
          {isError && <ErrorState onRetry={handleRefetch} />}
          {!isLoading && !isError && transactions.length === 0 && (
            <EmptyState />
          )}
          {!isLoading && !isError && transactions.length > 0 && (
            <TableBody>
              {visibleTransactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </TableBody>
          )}
        </Table>
      </div>

      {hasMore && !isLoading && !isError && (
        <div className="border-t border-border px-6 py-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll
              ? "Show less"
              : `Show ${transactions.length - PREVIEW_COUNT} more transactions`}
          </Button>
        </div>
      )}
    </div>
    
  );
};
