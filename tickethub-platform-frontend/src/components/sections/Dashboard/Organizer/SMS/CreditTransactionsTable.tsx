import React, { useEffect, useState, useCallback, useMemo } from "react";
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCreditTransactions,
  type CreditTransactionRecord,
} from "@/utils/services/organizers/sms.service";

type FetchState = "idle" | "loading" | "success" | "error";
type TransactionStatus = "completed" | "pending" | "failed";

const PREVIEW_COUNT = 5;

//  my date helpers 
function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function deriveStatus(tx: CreditTransactionRecord): TransactionStatus {
  if ("status" in tx && typeof tx.status === "string") {
    return tx.status as TransactionStatus;
  }
  return "completed";
}

//  Status Config 
const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="size-3.5" />,
    className: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="size-3.5" />,
    className: "bg-amber-100 text-amber-700",
  },
  failed: {
    label: "Failed",
    icon: <AlertCircle className="size-3.5" />,
    className: "bg-rose-100 text-rose-700",
  },
};

//  Skeleton for the oading data 
const TableSkeleton: React.FC = () => (
  <tbody className="divide-y divide-border">
    {Array.from({ length: 4 }).map((_, i) => (
      <tr key={i}>
        {Array.from({ length: 5 }).map((_, j) => (
          <td key={j} className="px-6 py-4">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
        ))}
      </tr>
    ))}
  </tbody>
);

const EmptyState: React.FC = () => (
  <tbody>
    <tr>
      <td colSpan={5} className="px-6 py-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-3 text-muted-foreground">
          <Receipt className="size-8 opacity-40" />
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs opacity-70">Your credit purchase history will appear here.</p>
        </div>
      </td>
    </tr>
  </tbody>
);

const ErrorState: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <tbody>
    <tr>
      <td colSpan={5} className="px-6 py-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-3 text-muted-foreground">
          <AlertCircle className="size-8 text-rose-400 opacity-70" />
          <p className="text-sm font-medium">Failed to load transactions</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <RefreshCw className="size-3.5" />
            Try again
          </button>
        </div>
      </td>
    </tr>
  </tbody>
);

const TransactionRow: React.FC<{ tx: CreditTransactionRecord }> = React.memo(({ tx }) => {
  const status = deriveStatus(tx);
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.completed;
  const creditsNum = Number(tx.credits) || 0;

  return (
    <tr className="transition-colors hover:bg-accent/40">
      <td className="px-6 py-4 text-muted-foreground">{formatDate(tx.createdAt)}</td>
      <td className="px-6 py-4">
        <span
          title={tx.reference}
          className="inline-block max-w-[160px] truncate font-mono text-xs text-muted-foreground"
        >
          {tx.reference}
        </span>
      </td>
      <td className="px-6 py-4 font-medium tabular-nums text-emerald-700">
        +{creditsNum.toLocaleString()}
      </td>
      <td className="px-6 py-4 capitalize text-foreground">{tx.type}</td>
      <td className="px-6 py-4">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            cfg.className
          )}
        >
          {cfg.icon}
          {cfg.label}
        </span>
      </td>
    </tr>
  );
});

TransactionRow.displayName = "TransactionRow";

//  Main Component 
export const CreditTransactionsTable: React.FC = () => {
  const [transactions, setTransactions] = useState<CreditTransactionRecord[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [showAll, setShowAll] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setFetchState("loading");
    try {
      const data = await getCreditTransactions();
      setTransactions(data);
      setFetchState("success");
    } catch (err) {
      console.error("Failed to load credit transactions:", err);
      setFetchState("error");
    }
  }, []);

  useEffect(() => {
  let isMounted = true;

  const runFetch = async () => {
    try {
      const data = await getCreditTransactions();
      if (isMounted) {
        setTransactions(data);
        setFetchState("success");
      }
    } catch (err) {
      console.error("Failed to load credit transactions:", err);
      if (isMounted) {
        setFetchState("error");
      }
    }
  };

  runFetch();

  return () => {
    isMounted = false;
  };
}, []);

  const visibleTransactions = useMemo(() => {
    return showAll ? transactions : transactions.slice(0, PREVIEW_COUNT);
  }, [showAll, transactions]);

  const hasMore = transactions.length > PREVIEW_COUNT;

  return (
    <div className="rounded-2xl border border-border bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground">Credit Transaction History</h3>
          {fetchState === "success" && transactions.length > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {transactions.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            disabled={fetchState === "loading"}
            className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            aria-label="Refresh transactions"
          >
            <RefreshCw
              className={cn("size-4", fetchState === "loading" && "animate-spin")}
            />
          </button>

          {hasMore && fetchState === "success" && (
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="text-sm font-medium text-primary hover:underline"
            >
              {showAll ? "Show less" : "View all"}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-6 py-3 font-medium">Date</th>
              <th className="px-6 py-3 font-medium">Reference</th>
              <th className="px-6 py-3 font-medium">Credits</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>

          {fetchState === "loading" && <TableSkeleton />}
          {fetchState === "error" && <ErrorState onRetry={fetchTransactions} />}
          {fetchState === "success" && transactions.length === 0 && <EmptyState />}
          {fetchState === "success" && transactions.length > 0 && (
            <tbody className="divide-y divide-border">
              {visibleTransactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* Footer view expand toggle */}
      {hasMore && fetchState === "success" && (
        <div className="border-t border-border px-6 py-3 text-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm font-medium text-primary hover:underline"
          >
            {showAll
              ? "Show less"
              : `Show ${transactions.length - PREVIEW_COUNT} more transactions`}
          </button>
        </div>
      )}
    </div>
  );
};