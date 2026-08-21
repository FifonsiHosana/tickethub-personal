import { useState } from "react";
import { toast } from "sonner";
import { CampaignComposer } from "@/components/sections/Dashboard/Organizer/SMS/CampaignComposer";
import {
  AudienceFilter,
  type AudienceSelection,
} from "@/components/sections/Dashboard/Organizer/SMS/AudienceFilter";
import { PreviewModal } from "@/components/sections/Dashboard/Organizer/SMS/PreviewModal";
import {
  useSendSms,
  useCreditWallet,
  // useEventTickets,
  useTicketHoldersPhoneNumbers,
} from "@/hooks/organizers/useOrganizerSms";
import {
  audienceLabel,
  normalizeRecipients,
  calculateCreditUsage,
} from "@/lib/sms";

export default function SmsCampaign() {
  const [message, setMessage] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [audience, setAudience] = useState<AudienceSelection>({
    mode: "event",
    groupIds: [],
    allGroups: false,
    customPhones: [],
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { data: wallet } = useCreditWallet();
  // const { data: eventTickets = [] } = useEventTickets(audience.mode === 'event' ? audience.eventId ?? null : null);
  const { data: eventPhones = [] } = useTicketHoldersPhoneNumbers(
    audience.mode === "event" ? (audience.eventId ?? null) : null,
    audience.allGroups ? [] : audience.groupIds,
  );

  const recipientPhones = (): string[] => {
    if (audience.mode === "custom") return audience.customPhones;
    if (audience.mode === "event") return eventPhones;
    return [];
  };

  const activeRecipients = recipientPhones();
  console.log("1",activeRecipients);
  console.log("2",eventPhones);
  const normalizedRecipients = normalizeRecipients(activeRecipients);
  const recipientCount = normalizedRecipients.length;
  const creditUsed = calculateCreditUsage(recipientCount);
  const creditsLeft = Number(wallet?.creditLeft ?? 0);
  const insufficientCredits = creditUsed > creditsLeft;

  const handleAudienceChange = (nextSelection: AudienceSelection) => {
    setAudience(nextSelection);
  };

  const { mutateAsync: sendSmsMutation } = useSendSms();

  const handleSendPreview = () => {
    const payload = {
      message,
      scheduled,
      audienceMode: audience.mode,
      audienceLabel: audienceLabel(audience),
      recipientCount,
      creditUsed,
      recipientPhones: normalizedRecipients,
      selectedEventId: audience.eventId,
      selectedGroupIds: audience.groupIds,
      sentAt: new Date().toISOString(),
    };

    console.log("SMS preview payload", payload);
    setPreviewOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message before sending.");
      setPreviewOpen(false);
      return;
    }

    if (recipientCount === 0) {
      toast.error("Select at least one recipient before sending.");
      setPreviewOpen(false);
      return;
    }

    if (insufficientCredits) {
      toast.error("Not enough credits to send this campaign.");
      setPreviewOpen(false);
      return;
    }

    try {
      setIsSending(true);
      const payload = {
        message,
        recipients: normalizedRecipients,
        sender: "TicketHub",
        scheduled,
        scheduleDate: scheduled
          ? new Date(Date.now() + 60 * 60 * 1000).toISOString()
          : undefined,
        meta: {
          selectedEventId: audience.eventId,
          audienceMode: audience.mode,
          selectedGroupIds: audience.groupIds,
          audienceLabel: audienceLabel(audience),
        },
      };

      await sendSmsMutation(payload);
      toast.success(
        `Message sent successfully to ${recipientCount} recipients!`,
      );
    } catch (err) {
      console.error("Failed to send SMS:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Could not send SMS. Please try again.",
      );
    } finally {
      setIsSending(false);
      setPreviewOpen(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6 bg-background p-6 md:p-8 lg:p-10">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AudienceFilter
          selection={audience}
          onSelectionChange={handleAudienceChange}
        />
        <CampaignComposer
          message={message}
          onMessageChange={setMessage}
          scheduled={scheduled}
          onScheduledChange={setScheduled}
          onsetPreviewModalOpen={setPreviewOpen}
          onSendPreview={handleSendPreview}
        />
      </div>

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleConfirmSend}
        message={message}
        scheduled={scheduled}
        audienceLabel={audienceLabel(audience)}
        recipientCount={recipientCount}
        creditUsed={creditUsed}
        insufficientCredits={insufficientCredits}
        isSubmitting={isSending}
      />
    </div>
  );
}
