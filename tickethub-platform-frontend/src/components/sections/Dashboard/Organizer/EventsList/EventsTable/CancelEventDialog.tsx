import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCancelOrganizerEvent,
  usePublishOrganizerEvent,
} from "@/hooks/organizers/useOrganizerEvents";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
  eventName: string;
  action: "cancel" | "publish";
}

export function CancelEventDialog({
  open,
  onOpenChange,
  eventId,
  eventName,
  action,
}: Props) {
  const cancelMutation = useCancelOrganizerEvent();
  const publishMutation = usePublishOrganizerEvent();
  const isPublish = action === "publish";
  const mutation = isPublish ? publishMutation : cancelMutation;

  const handleConfirm = async () => {
    if (!eventId) return;
    try {
      await mutation.mutateAsync(eventId);
      toast.success(isPublish ? "Event published" : "Event cancelled");
      onOpenChange(false);
    } catch {
      toast.error(isPublish ? "Failed to publish event" : "Failed to cancel event");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isPublish ? "Publish Event" : "Cancel Event"}
      description={
        isPublish
          ? `Publish "${eventName}" again? If approved, it will be visible on public pages and buyers can purchase tickets.`
          : `Are you sure you want to cancel "${eventName}"? Buyers will no longer be able to purchase tickets.`
      }
      confirmText={isPublish ? "Publish Event" : "Cancel Event"}
      variant={isPublish ? "default" : "destructive"}
      onConfirm={handleConfirm}
    />
  );
}
