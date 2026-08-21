import React from "react";
import { Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const MAX_LENGTH = 160;

type CampaignComposerProps = {
  message: string;
  onMessageChange: (value: string) => void;
  scheduled: boolean;
  onScheduledChange: (value: boolean) => void;
  onsetPreviewModalOpen: (value: boolean) => void;
  onSendPreview: () => void;
};

export const CampaignComposer: React.FC<CampaignComposerProps> = ({
  message,
  onMessageChange,
  scheduled,
  onScheduledChange,
  onsetPreviewModalOpen,
  onSendPreview,
}) => {
  const remaining = MAX_LENGTH - message.length;
  const segments = Math.max(1, Math.ceil(message.length / MAX_LENGTH));

  const handleSend = () => {
    onSendPreview();
    onsetPreviewModalOpen(true);
  };

  return (
    <Card className="rounded-xl bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Send className="size-5" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">New Message</h3>
          <p className="text-sm text-muted-foreground">
            Compose and send a text blast to your audience.
          </p>
        </div>
      </div>

      {/* Message box */}
      <div className="rounded-xl border border-border bg-background p-3 focus-within:border-primary">
        <textarea
          value={message}
          onChange={(e) =>
            onMessageChange(e.target.value.slice(0, MAX_LENGTH * 3))
          }
          rows={4}
          placeholder="Hey {{first_name}}, your tickets for {{event}} are ready! Reply STOP to opt out."
          className="w-full resize-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
        />
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              className="rounded-lg p-1.5 hover:bg-accent"
              aria-label="Emoji"
            >
              <Smile className="size-4" />
            </button>
          </div>
          <span
            className={cn(
              "text-xs",
              remaining < 0 ? "text-rose-600" : "text-muted-foreground",
            )}
          >
            {message.length}/{MAX_LENGTH} * {segments} segment
            {segments > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Schedule toggle */}
      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl bg-accent/50 px-4 py-3">
        <span className="text-sm font-medium text-foreground">
          Schedule for later
        </span>
        <input
          type="checkbox"
          checked={scheduled}
          onChange={(e) => onScheduledChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="relative h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-primary">
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-white transition-transform",
              scheduled ? "translate-x-5" : "translate-x-0.5",
            )}
          />
        </span>
      </label>

      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="outline" className="rounded-xl">
          Save draft
        </Button>
        {/* <Button className="gap-2 rounded-xl px-4 py-4">
          <Send className="size-4" />
          {scheduled ? "Schedule send" : "Send now"}
        </Button> */}

        {/* Preview trigger */}
        <div className="flex justify-end">
          <Button className="gap-2 rounded-xl px-4 py-4" onClick={handleSend}>
            {/* <Eye className="size-4" /> */}
            Preview &amp; Send
          </Button>
        </div>
      </div>
    </Card>
  );
};
