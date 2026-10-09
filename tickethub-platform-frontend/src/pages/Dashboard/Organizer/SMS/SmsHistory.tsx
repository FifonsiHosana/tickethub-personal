import { useState } from "react";
import { SmsHistoryTable } from "@/components/sections/Dashboard/Organizer/SMS/SmsHistoryTable";
import { CreditTransactionsTable } from "@/components/sections/Dashboard/Organizer/SMS/CreditTransactionsTable";
import { cn } from "@/lib/utils";

type Tab = "messages" | "transactions";
type SmsHistoryProps = { embedded?: boolean };

export default function SmsHistory({ embedded = false }: SmsHistoryProps) {
  const [tab, setTab] = useState<Tab>("messages");
  const tabs: { id: Tab; label: string }[] = [
    { id: "messages", label: "Message History" },
    { id: "transactions", label: "Credit Transaction History" },
  ];

  return (
    <div className={cn("flex flex-col gap-6 overflow-hidden", embedded ? "min-h-[520px]" : "h-screen p-6")}>
      <div className="flex shrink-0 gap-1 overflow-x-auto rounded-xl border border-border p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "min-w-max flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              tab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "messages" ? <SmsHistoryTable /> : <CreditTransactionsTable />}
      </div>
    </div>
  );
}
