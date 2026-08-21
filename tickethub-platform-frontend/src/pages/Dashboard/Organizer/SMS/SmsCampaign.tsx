import { useState, useEffect } from "react";
import { CampaignComposer } from "@/components/sections/Dashboard/Organizer/SMS/CampaignComposer";
import {
  AudienceFilter,
  type AudienceSelection,
} from "@/components/sections/Dashboard/Organizer/SMS/AudienceFilter";
import { PreviewModal } from "@/components/sections/Dashboard/Organizer/SMS/PreviewModal";
import { SuccessModal } from "@/components/ui/success-modal";
import { getCreditSnapshot } from "@/stores/creditStore";
import { getTicketHoldersPhoneNumbers } from "@/utils/services/organizers/tickets.service";
import { sendSms } from "@/utils/services/organizers/sms.service";

const CREDIT_PER_SMS = Number(import.meta.env.VITE_CREDIT_PER_SMS || 1);

function audienceLabel(selection: AudienceSelection): string {
  if (selection.mode === "import") return "Imported contacts";
  if (selection.mode === "custom")
    return `${selection.customPhones.length} custom number${
      selection.customPhones.length === 1 ? "" : "s"
    }`;
  if (selection.mode === "event") {
    if (selection.allGroups) return "All groups";
    if (selection.groupIds.length > 0)
      return `${selection.groupIds.length} group${
        selection.groupIds.length > 1 ? "s" : ""
      } selected`;
    return "Event audience";
  }
  return "—";
}

export default function SmsCampaign() {
  const [message, setMessage] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [audience, setAudience] = useState<AudienceSelection>({
    mode: "event",
    groupIds: [],
    allGroups: false,
    customPhones: [],
  });

  // State to hold active event phone numbers fetched from backend
  const [eventPhones, setEventPhones] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Fetch unique event phone numbers when event mode and eventId are active
  useEffect(() => {
    if (audience.mode !== "event" || !audience.eventId) {
      return;
    }

    let active = true;
    async function fetchPhones() {
      try {
        const phones = await getTicketHoldersPhoneNumbers(
          audience.eventId!,
          audience.allGroups ? [] : audience.groupIds,
        );
        if (active) setEventPhones(phones);
      } catch (err) {
        console.error("Failed to load audience phone numbers:", err);
      }
    }

    fetchPhones();
    return () => {
      active = false;
    };
  }, [audience.mode, audience.eventId, audience.allGroups, audience.groupIds]);

  // Derive active phone numbers based on selection mode
  const recipientPhones = (): string[] => {
    if (audience.mode === "custom") return audience.customPhones;
    if (audience.mode === "event") return eventPhones;
    return [];
  };

  const activeRecipients = recipientPhones();
  const normalizedRecipients = Array.from(
    new Set(
      activeRecipients
        .map((value) => value?.toString().trim())
        .filter((value): value is string => Boolean(value) && value.length >= 8),
    ),
  );
  const recipientCount = normalizedRecipients.length;
  const creditUsed = recipientCount * CREDIT_PER_SMS;
  const creditsLeft = getCreditSnapshot().total - getCreditSnapshot().used;
  const insufficientCredits = creditUsed > creditsLeft;

  const handleAudienceChange = (nextSelection: AudienceSelection) => {
    setEventPhones([]);
    setAudience(nextSelection);
  };

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
      setSuccessMessage("Please enter a message before sending.");
      setShowSuccessModal(true);
      setPreviewOpen(false);
      return;
    }

    if (recipientCount === 0) {
      setSuccessMessage("Select at least one recipient before sending.");
      setShowSuccessModal(true);
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

      await sendSms(payload);
      setSuccessMessage(
        `Message sent successfully to ${recipientCount} recipients!`
      );
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Failed to send SMS:", err);
      setSuccessMessage(
        err instanceof Error ? err.message : "Could not send SMS. Please try again."
      );
      setShowSuccessModal(true);
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

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Message Sent!"
        message={successMessage}
      />
    </div>
  );
}