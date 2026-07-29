import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateEventVenue } from "@/hooks/organizers/useOrganizerEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { DialogFooter } from "@/components/ui/dialog";

interface Props {
  onOpenChange: (open: boolean) => void;
  onSuccess: (venue: { id: number }) => void;
}

export default function VenueForm({ onOpenChange, onSuccess }: Props) {
  const { mutateAsync: createVenue, isPending } = useCreateEventVenue();

  const [venueName, setVenueName] = useState("");
  const [address, setAddress] = useState("");
  const [cityOrTown, setCityOrTown] = useState("");
  const [country, setCountry] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");

  async function handleSubmit() {
    if (!venueName || !cityOrTown || !country) return;
    const result = await createVenue({
      venue_name: venueName,
      address: address || undefined,
      city_or_town: cityOrTown,
      country,
      googleMapLink: googleMapLink || undefined,
    });
    toast.success("Venue added");
    onSuccess(result);
    onOpenChange(false);
  }

  const valid =
    venueName.length >= 1 && cityOrTown.length >= 1 && country.length >= 1;

  return (
    <>
      <div className="space-y-3">
        <Field>
          <FieldLabel>
            Venue Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            placeholder="e.g. Accra International Conference Centre"
          />
        </Field>
        <Field>
          <FieldLabel>
            City/Town <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            value={cityOrTown}
            onChange={(e) => setCityOrTown(e.target.value)}
            placeholder="e.g. Accra"
          />
        </Field>
        <Field>
          <FieldLabel>
            Country <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g. Ghana"
          />
        </Field>
        <Field>
          <FieldLabel>Address</FieldLabel>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address (optional)"
          />
        </Field>
        <Field>
          <FieldLabel>Google Maps Link</FieldLabel>
          <Input
            value={googleMapLink}
            onChange={(e) => setGoogleMapLink(e.target.value)}
            placeholder="https://maps.google.com/... (optional)"
          />
        </Field>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!valid || isPending}
        >
          {isPending && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
          {isPending ? "Saving..." : "Save Venue"}
        </Button>
      </DialogFooter>
    </>
  );
}
