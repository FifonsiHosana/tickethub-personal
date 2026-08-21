import React from "react";
import { Users, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Contact } from "@/misc/campaignData";

const MAX_LENGTH = 160;

type CampaignPreviewerProps = {
  message: string;
  scheduled: boolean;
  contacts: Contact[];
  selected: string[];
};

// Sample values used to render the {{variables}} in the preview.
const SAMPLE_VARS: Record<string, string> = {
  first_name: "Sarah",
  event: "Accra Music Festival",
};

function renderPreview(text: string): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => {
    const value = SAMPLE_VARS[key.toLowerCase()];
    return value ? value : `{{${key}}}`;
  });
}

function formatNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const CampaignPreviewer: React.FC<CampaignPreviewerProps> = ({
  message,
  scheduled,
  contacts,
  selected,
}) => {
  const recipients = contacts.filter((c) => selected.includes(c.id));
  const recipientCount = recipients.length;
  const length = message.length;
  const segments = Math.max(1, Math.ceil(length / MAX_LENGTH));
  const remaining = MAX_LENGTH - length;
  const hasMessage = message.trim().length > 0;

  return (
    <div className="rounded-2xl border border-border bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Eye className="size-5" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">Live Preview</h3>
          <p className="text-sm text-muted-foreground">
            See how your message will look.
          </p>
        </div>
      </div>

      {/* Simple preview box */}
      <div className="rounded-xl border border-border h-70 bg-background p-4">
        {hasMessage ? (
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[13px] leading-snug text-primary-foreground shadow-sm">
              {renderPreview(message)}
              <div className="mt-1 text-right text-[9px] text-primary-foreground/70">
                {formatNow()}
              </div>
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Your message preview will appear here as you type.
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            Recipients
          </span>
          <span className="font-medium text-foreground">
            {recipientCount} selected
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4" />
            Delivery
          </span>
          <span
            className={cn(
              "font-medium",
              scheduled ? "text-primary" : "text-foreground"
            )}
          >
            {scheduled ? "Scheduled" : "Send now"}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Length</span>
          <span
            className={cn(
              "font-medium",
              remaining < 0 ? "text-rose-600" : "text-foreground"
            )}
          >
            {length}/{MAX_LENGTH} * {segments} segment
            {segments > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
};
