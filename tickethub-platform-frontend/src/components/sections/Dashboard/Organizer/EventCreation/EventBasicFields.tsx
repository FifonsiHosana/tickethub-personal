import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarIcon, UsersIcon, PlusIcon } from "lucide-react";
import { type CreateEventFormValues } from "@/types/organizer/event.schema";
import { useEventVenues } from "@/hooks/organizers/useOrganizerEvents";
import { Field, FieldLabel, FieldError, FieldContent } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { AddVenueDialog } from "./AddVenueDialog";

type Venue = { id: number; venue_name: string };

export function EventBasicFields() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CreateEventFormValues>();
  const { data: venues = [], isLoading } = useEventVenues();
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Field data-invalid={!!errors.title}>
        <FieldLabel htmlFor="title">Event Title</FieldLabel>
        <Input {...register("title")} id="title" placeholder="e.g. Summer Music Festival 2026" />
        {errors.title && <FieldError errors={[errors.title]} />}
      </Field>

      <Field>
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <Textarea {...register("description")} id="description" placeholder="Tell attendees what to expect..." className="min-h-16" />
        {errors.description && <FieldError errors={[errors.description]} />}
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Field data-invalid={!!errors.dateAndTime}>
          <FieldLabel htmlFor="dateAndTime">Date and Time</FieldLabel>
          <div className="relative max-w-55">
            <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input {...register("dateAndTime")} id="dateAndTime" type="datetime-local" className="pl-9" />
          </div>
          {errors.dateAndTime && <FieldError errors={[errors.dateAndTime]} />}
        </Field>

        <Field data-invalid={!!errors.eventVenueId}>
          <FieldLabel htmlFor="eventVenueId">Event Venue</FieldLabel>
          <FieldContent>
            <div className="flex items-start gap-2">
              <div className="max-w-55 flex-1 min-w-0">
                <Combobox
                  items={venues}
                  itemToStringValue={(v: Venue) => v.venue_name}
                  value={venues.find((v: Venue) => v.id === watch("eventVenueId"))?.venue_name ?? null}
                  onValueChange={(venue: Venue | null) => {
                    if (venue) setValue("eventVenueId", venue.id, { shouldValidate: true });
                  }}
                >
                  <ComboboxInput
                    className="border border-gray-300 focus-within:border-none focus-visible:border-none"
                    id="eventVenueId"
                    disabled={isLoading}
                    placeholder={isLoading ? "Loading..." : "Select a venue"}
                  />
                  <ComboboxContent className="bg-white">
                    <ComboboxEmpty>No venue found.</ComboboxEmpty>
                    <ComboboxList>
                      {(venue: Venue) => (
                        <ComboboxItem key={venue.id} value={venue}>
                          {venue.venue_name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="sm:hidden mt-0.5 shrink-0"
                onClick={() => setVenueDialogOpen(true)}
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex mt-1"
              onClick={() => setVenueDialogOpen(true)}
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Add Venue
            </Button>
          </FieldContent>
          {errors.eventVenueId && <FieldError errors={[errors.eventVenueId]} />}
        </Field>
        <AddVenueDialog
          open={venueDialogOpen}
          onOpenChange={setVenueDialogOpen}
          onSuccess={(venue) => setValue("eventVenueId", venue.id, { shouldValidate: true })}
        />

        <Field data-invalid={!!errors.capacity}>
          <FieldLabel htmlFor="capacity">Total Capacity</FieldLabel>
          <div className="relative max-w-45">
            <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("capacity", { valueAsNumber: true })}
              id="capacity" type="number" min="1" className="pl-9"
            />
          </div>
          {errors.capacity && <FieldError errors={[errors.capacity]} />}
        </Field>
      </div>
    </div>
  );
}
