import React from "react";
import { X, Smartphone, Users, Coins, Clock, AlertTriangle } from "lucide-react";
import { renderSmsPreview, formatNow } from "@/lib/smsPreview";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type PreviewModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  message: string;
  scheduled: boolean;
  audienceLabel: string;
  recipientCount: number;
  creditUsed: number;
  insufficientCredits?: boolean;
  isSubmitting?: boolean;
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  open,
  onClose,
  onConfirm,
  message,
  scheduled,
  audienceLabel,
  recipientCount,
  creditUsed,
  insufficientCredits = false,
  isSubmitting = false,
}) => {
  if (!open) return null;

  const hasMessage = message.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-medium text-foreground">Message Preview</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent"
            aria-label="Close preview"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Phone mockup */}
        <div className="mx-auto w-full max-w-[240px]">
          <div className="relative rounded-[2.25rem] border-[6px] border-foreground/90 bg-foreground/90 p-2 shadow-lg">
            <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-foreground/90" />
            <div className="flex h-[360px] flex-col overflow-hidden rounded-[1.6rem] bg-background">
              <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-medium text-foreground/70">
                <span>{formatNow()}</span>
                <span className="flex items-center gap-0.5">
                  <span className="inline-block size-2 rounded-sm bg-foreground/70" />
                  <span className="inline-block size-2 rounded-sm bg-foreground/70" />
                  <span className="inline-block size-2 rounded-sm bg-foreground/70" />
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-end gap-2 overflow-y-auto px-3 py-4">
                {hasMessage ? (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[13px] leading-snug text-primary-foreground shadow-sm">
                      {renderSmsPreview(message)}
                      <div className="mt-1 text-right text-[9px] text-primary-foreground/70">
                        {formatNow()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="m-auto flex flex-col items-center gap-2 text-center text-muted-foreground">
                    <Smartphone className="size-8 opacity-40" />
                    <p className="text-xs">No message to preview yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              Audience
            </span>
            <span className="font-medium text-foreground">{audienceLabel}</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" />
              Recipients
            </span>
            <span className="font-medium text-foreground">
              {recipientCount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-accent/50 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Coins className="size-4" />
              Credits used
            </span>
            <span className="font-medium text-foreground">
              {creditUsed.toLocaleString()}
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
        </div>

        {/* Insufficient credits warning */}
        {insufficientCredits && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertTriangle className="size-4 shrink-0" />
            <span>Not enough credits to send this campaign.</span>
          </div>
        )}

        {/* Confirm send */}
        <div className="mt-5 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          {onConfirm && (
            <Button
              onClick={onConfirm}
              disabled={insufficientCredits || isSubmitting}
              className="gap-2 rounded-xl px-4 py-4"
            >
              {isSubmitting ? "Sending..." : "Confirm & Send"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
