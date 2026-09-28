import { useFormContext } from "react-hook-form";
import type { CreateEventFormValues } from "@/types/organizer/event.schema";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

export default function VenueForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();
  const venueErrors = errors.venue;

  return (
    <>
      <div className="space-y-3">
        <Field data-invalid={!!venueErrors?.venue_name}>
          <FieldLabel>
            Venue Name <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("venue.venue_name")}
            placeholder="e.g. Accra International Conference Centre"
          />
          {venueErrors?.venue_name && (
            <FieldError errors={[venueErrors.venue_name]} />
          )}
        </Field>
        <Field data-invalid={!!venueErrors?.city_or_town}>
          <FieldLabel>
            City/Town <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("venue.city_or_town")}
            placeholder="e.g. Accra"
          />
          {venueErrors?.city_or_town && (
            <FieldError errors={[venueErrors.city_or_town]} />
          )}
        </Field>
        <Field data-invalid={!!venueErrors?.country}>
          <FieldLabel>
            Country <span className="text-destructive">*</span>
          </FieldLabel>
          <Input {...register("venue.country")} placeholder="e.g. Ghana" />
          {venueErrors?.country && (
            <FieldError errors={[venueErrors.country]} />
          )}
        </Field>
        <Field>
          <FieldLabel>Address</FieldLabel>
          <Input
            {...register("venue.address")}
            placeholder="Street address (optional)"
          />
        </Field>
        <Field>
          <FieldLabel>Google Maps Link</FieldLabel>
          <Input
            {...register("venue.googleMapLink")}
            placeholder="https://maps.google.com/... (optional)"
          />
        </Field>
      </div>
    </>
  );
}
