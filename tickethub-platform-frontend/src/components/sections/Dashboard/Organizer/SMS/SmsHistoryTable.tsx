import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
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
import { useSmsHistory } from "@/hooks/organizers/useOrganizerSms";
import {
  parseRecipients,
  formatDate,
  recipientStatusConfig,} from "@/lib/sms";
import { Card } from "@/components/ui/card";

export const SmsHistoryTable: React.FC = () => {
  const { data: history = [], isLoading, isError, refetch } = useSmsHistory();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  return (
    <Card className="rounded-xl border  overflow-hidden border-border">
      <div className=" ">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h3 className="font-medium text-foreground">Message History</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setExpandedId(null)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Collapse all
            </button>
            <button
              type="button"
              onClick={() => refetch}
              disabled={isLoading}
              className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
              aria-label="Refresh history"
            >
              <ChevronDown
                className={cn("size-4", isLoading && "animate-spin")}
              />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender / Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Units Spent</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <ChevronDown className="size-4 animate-spin text-primary" />
                      <span>Loading message history…</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-8 text-center text-rose-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span>Failed to load message history.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <div className="w-full h-64 flex flex-col items-center justify-center rounded-xl  text-center">
                      <svg
                        className="h-10 w-10 text-neutral mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-foreground">
                        No message history yet
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        Sent campaigns will appear here once you start messaging
                        attendees.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((c) => {
                  const expanded = expandedId === c.id;
                  const recipientsList = parseRecipients(
                    c.recipients,
                    c.status,
                  );
                  const unitCount = recipientsList.length;

                  const filteredRecipients = recipientsList.filter(
                    (r) =>
                      !query ||
                      r.name.toLowerCase().includes(query) ||
                      r.phone.toLowerCase().includes(query),
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
                          <div className="font-medium text-foreground">
                            {c.sender}
                          </div>
                          <div className="max-w-xs truncate text-xs text-muted-foreground">
                            {c.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "capitalize",
                              c.status === "sent" &&
                                "bg-emerald-100 text-emerald-700",
                              c.status === "failed" &&
                                "bg-rose-100 text-rose-700",
                              c.status === "pending" &&
                                "bg-amber-100 text-amber-700",
                              c.status === "scheduled" &&
                                "bg-sky-100 text-sky-700",
                              c.status === "draft" &&
                                "bg-slate-100 text-slate-700",
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
                              expanded && "rotate-180",
                            )}
                          />
                        </TableCell>
                      </TableRow>

                      {expanded && (
                        <TableRow className="bg-accent/20">
                          <TableCell colSpan={5} className="px-6 py-4">
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                              <svg
                                className="size-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
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

                            <ul className="divide-y divide-border rounded-xl border border-border ">
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
                                          rc.className,
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
    </Card>
  );
};
