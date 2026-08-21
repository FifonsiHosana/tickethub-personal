import React, { useEffect, useState } from "react";
import { ChevronDown, CheckCheck, Search, Loader2Icon, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getSmsHistory, type SmsHistoryItem } from "@/utils/services/organizers/sms.service";

interface RecipientItem {
  name: string;
  phone: string;
  status: "sent" | "delivered" | "failed" | "pending" | "scheduled" | "draft";
}

const recipientStatusConfig: Record<string, { label: string; className: string }> = {
  sent: { label: "Sent", className: "bg-emerald-100 text-emerald-700" },
  delivered: { label: "Delivered", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Failed", className: "bg-rose-100 text-rose-700" },
  pending: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Scheduled", className: "bg-sky-100 text-sky-700" },
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700" },
};

function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
  Normalizes recipients data into a uniform structure whether it is stored
  as a simple array of string numbers or detailed recipient objects.
 */
function parseRecipients(raw: string | unknown[], defaultStatus: string): RecipientItem[] {
  let parsed: unknown = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = [raw];
    }
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map((item) => {
    if (typeof item === "string") {
      return {
        name: "Recipient",
        phone: item,
        status: (defaultStatus as "sent" | "delivered" | "failed") || "sent",
      };
    }
    return {
      name: item.name || "Recipient",
      phone: item.phone || item.phoneNumber || "—",
      status: item.status || defaultStatus || "sent",
    };
  });
}

export const SmsHistoryTable: React.FC = () => {
  const [history, setHistory] = useState<SmsHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        setLoading(true);
        setError(null);
        const data = await getSmsHistory();
        console.log("SMS history fetched:", data);
        if (active) {
          setHistory(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to fetch SMS history:", err);
          setError("Failed to load message history.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  const query = search.trim().toLowerCase();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-300 overflow-hidden bg-white">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-medium text-foreground">Message History</h3>
          <button
            type="button"
            onClick={() => setExpandedId(null)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Collapse all
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-neutral-50">
              <TableRow>
                <TableHead>Sender / Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Units Spent</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2Icon className="size-4 animate-spin text-primary" />
                      <span>Loading message history…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-8 text-center text-rose-500">
                    <div className="flex items-center justify-center gap-2">
                      <span>{error}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    <div className="w-full h-64 flex flex-col items-center justify-center rounded-xl bg-white text-center">
                      <UsersIcon className="h-10 w-10 text-neutral-300 mb-3" />
                      <h3 className="text-lg font-semibold text-foreground">
                        No message history yet
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Sent campaigns will appear here once you start messaging attendees.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((c) => {
                  const expanded = expandedId === c.id;
                  const recipientsList = parseRecipients(c.recipients, c.status);
                  const unitCount = recipientsList.length;

                  const filteredRecipients = recipientsList.filter(
                    (r) =>
                      !query ||
                      r.name.toLowerCase().includes(query) ||
                      r.phone.toLowerCase().includes(query)
                  );

                  return (
                    <React.Fragment key={c.id}>
                      <TableRow
                        className="cursor-pointer transition-colors hover:bg-accent/40"
                        onClick={() =>
                          setExpandedId((prev) => (prev === c.id ? null : c.id))
                        }
                      >
                        <TableCell>
                          <div className="font-medium text-foreground">{c.sender}</div>
                          <div className="max-w-xs truncate text-xs text-muted-foreground">
                            {c.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize",
                              c.status === "sent" && "bg-emerald-100 text-emerald-700",
                              c.status === "failed" && "bg-rose-100 text-rose-700",
                              c.status === "pending" && "bg-amber-100 text-amber-700",
                              c.status === "scheduled" && "bg-sky-100 text-sky-700",
                              c.status === "draft" && "bg-slate-100 text-slate-700"
                            )}
                          >
                            {c.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-foreground">
                          {unitCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {formatDate(c.sentAt || c.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChevronDown
                            className={cn(
                              "size-4 text-muted-foreground transition-transform",
                              expanded && "rotate-180"
                            )}
                          />
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow className="bg-accent/20">
                          <TableCell colSpan={5} className="px-6 py-4">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              <CheckCheck className="size-3.5" />
                              Recipients ({recipientsList.length})
                            </div>

                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary">
                              <Search className="size-4 text-muted-foreground" />
                              <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name or phone…"
                                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
                              />
                            </div>

                            <ul className="divide-y divide-border rounded-xl border border-border bg-white">
                              {filteredRecipients.length > 0 ? (
                                filteredRecipients.map((r, i) => {
                                  const rc =
                                    recipientStatusConfig[r.status] ||
                                    recipientStatusConfig.sent;
                                  return (
                                    <li
                                      key={i}
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm"
                                    >
                                      <span className="font-medium text-foreground">
                                        {r.name}
                                      </span>
                                      <span className="text-muted-foreground tabular-nums">
                                        {r.phone}
                                      </span>
                                      <span
                                        className={cn(
                                          "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                                          rc.className
                                        )}
                                      >
                                        {rc.label}
                                      </span>
                                    </li>
                                  );
                                })
                              ) : (
                                <li className="px-4 py-3 text-sm text-muted-foreground">
                                  No matching contacts found.
                                </li>
                              )}
                            </ul>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};