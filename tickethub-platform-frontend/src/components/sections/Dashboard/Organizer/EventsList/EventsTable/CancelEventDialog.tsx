import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useCancelOrganizerEvent } from "@/hooks/organizers/useOrganizerEvents";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
  eventName: string;
}

export function CancelEventDialog({ open, onOpenChange, eventId, eventName }: Props) {
  const mutation = useCancelOrganizerEvent();

  const handleCancel = async () => {
    if (!eventId) return;
    try {
      await mutation.mutateAsync(eventId);
      toast.success("Event cancelled");
      onOpenChange(false);
    } catch {
      toast.error("Failed to cancel event");
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Cancel Event"
      description={`Are you sure you want to cancel "${eventName}"? This action cannot be undone.`}
      confirmText="Cancel Event"
      variant="destructive"
      onConfirm={handleCancel}
    />
  );
}
