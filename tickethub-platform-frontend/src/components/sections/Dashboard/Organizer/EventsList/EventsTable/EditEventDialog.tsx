import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateOrganizerEvent } from "@/hooks/organizers/useOrganizerEvents";
import { toast } from "sonner";
import type { OrganizerEventResponse } from "@/utils/services/organizers/events.service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: OrganizerEventResponse | null;
}

export function EditEventDialog({ open, onOpenChange, event }: Props) {
  const mutation = useUpdateOrganizerEvent();

  const [formData, setFormData] = useState({
    title: event?.title ?? "",
    description: event?.description ?? "",
    capacity: String(event?.capacity ?? ""),
    dateAndTime: event?.dateAndTime
      ? new Date(event.dateAndTime).toISOString()
      : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    if (!event) return;
    try {
      await mutation.mutateAsync({
        eventId: event.id,
        payload: { ...formData, description: formData.description || undefined, capacity: Number(formData.capacity), dateAndTime: new Date(formData.dateAndTime).toISOString() },
      });
      toast.success("Event updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update event");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dateAndTime">Date & Time</Label>
            <Input
              id="dateAndTime"
              type="datetime-local"
              value={formData.dateAndTime}
              onChange={handleChange}
            />
          </div>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={mutation.isPending || !formData.title || !formData.capacity}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
