import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import VenueForm from "./VenueForm";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (venue: { id: number }) => void;
}

export function AddVenueDialog({ open, onOpenChange, onSuccess }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Venue</DialogTitle>
        </DialogHeader>
        {open && (
          <VenueForm onOpenChange={onOpenChange} onSuccess={onSuccess} />
        )}
      </DialogContent>
    </Dialog>
  );
}
