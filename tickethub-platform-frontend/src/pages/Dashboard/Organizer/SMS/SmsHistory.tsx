import { useState } from "react";
import { SmsHistoryTable } from "@/components/sections/Dashboard/Organizer/SMS/SmsHistoryTable";
import { CreditTransactionsTable } from "@/components/sections/Dashboard/Organizer/SMS/CreditTransactionsTable";
import { cn } from "@/lib/utils";

type Tab = "messages" | "transactions";

export default function SmsHistory() {
  const [tab, setTab] = useState<Tab>("messages");

  const tabs: { id: Tab; label: string }[] = [
    { id: "messages", label: "Message History" },
    { id: "transactions", label: "Credit Transaction History" },
  ];

  return (
      <div className="flex h-screen max-w-10xl flex-col gap-6 p-6 overflow-hidden">
      {/* Tabs */}
      <div className="flex shrink-0 gap-1 rounded-xl border border-border p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto min-h-0">
        {tab === "messages" ? <SmsHistoryTable /> : <CreditTransactionsTable />}
      </div>
    </div>

  );
}
