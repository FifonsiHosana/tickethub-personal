import React from "react";
import { MoreHorizontal, CheckCircle2, Clock, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CampaignStatus = "sent" | "scheduled" | "draft" | "failed";

type Campaign = {
  id: string;
  name: string;
  audience: string;
  status: CampaignStatus;
  unit?: number;
  sent: number;
  delivered: number;
  date: string;
};

const statusConfig: Record<
  CampaignStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  sent: {
    label: "Sent",
    icon: <CheckCircle2 className="size-3.5" />,
    className: "bg-emerald-100 text-emerald-700",
  },
  scheduled: {
    label: "Scheduled",
    icon: <Clock className="size-3.5" />,
    className: "bg-amber-100 text-amber-700",
  },
  draft: {
    label: "Draft",
    icon: <Send className="size-3.5" />,
    className: "bg-slate-100 text-slate-600",
  },
  failed: {
    label: "Failed",
    icon: <AlertCircle className="size-3.5" />,
    className: "bg-rose-100 text-rose-700",
  },
};

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Early Bird Reminder",
    audience: "Ticket holders",
    status: "sent",
    unit: 897,
    sent: 4820,
    delivered: 4712,
    date: "Jul 10, 2026",
  },
  {
    id: "2",
    name: "VIP Pre-Party Invite",
    audience: "VIP guests",
    status: "scheduled",
    unit: 645,
    sent: 0,
    delivered: 0,
    date: "Jul 16, 2026",
  },
  {
    id: "3",
    name: "Last Minute Drop",
    audience: "Waitlist",
    status: "sent",
    unit: 688,
    sent: 1290,
    delivered: 1188,
    date: "Jul 08, 2026",
  },
  {
    id: "4",
    name: "Post-Event Thank You",
    audience: "All attendees",
    status: "draft",
    unit: 870,
    sent: 0,
    delivered: 0,
    date: "ΓÇö",
  },
  {
    id: "5",
    name: "Weather Alert",
    audience: "All attendees",
    status: "failed",
    unit: 5200,
    sent: 5400,
    delivered: 0,
    date: "Jul 05, 2026",
  },
];

export const CampaignList: React.FC = () => {
  return (
    <div className="rounded-2xl border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h3 className="font-medium text-foreground">Recent Campaigns</h3>
        <button className="text-sm font-medium text-primary hover:underline">
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {campaigns.map((c) => {
          const cfg = statusConfig[c.status];
          const rate =
            c.sent > 0 ? Math.round((c.delivered / c.sent) * 100) : null;
          return (
            <div
              key={c.id}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-accent/40"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">
                    {c.name}
                  </p>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      cfg.className
                    )}
                  >
                    {cfg.icon}
                    {cfg.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {c.audience} * {c.date}
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {c.unit}
                </p>
                <p className="text-xs text-muted-foreground">unit(s)</p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {c.sent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">sent</p>
              </div>

              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-foreground">
                  {rate !== null ? `${rate}%` : "ΓÇö"}
                </p>
                <p className="text-xs text-muted-foreground">delivered</p>
              </div>

              <button
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent"
                aria-label="More options"
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
