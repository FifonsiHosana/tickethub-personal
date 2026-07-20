import { Controller, type Control, type UseFormReturn } from "react-hook-form";
import { UsersIcon } from "lucide-react";
import { type CreateEventFormValues } from "@/types/organizer/event.schema";
import { useEventVenues } from "@/hooks/organizers/useOrganizerEvents";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  //   FieldDescription,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface VenueAndCapacityProps {
  control: Control<CreateEventFormValues>;
  form: UseFormReturn<CreateEventFormValues>;
}

type Venue = {
  id: number;
  venue_name: string;
};

export const VenueAndCapacityCard = ({
  control,
  form,
}: VenueAndCapacityProps) => {
  const { data: venues = [], isLoading: isLoadingVenues } = useEventVenues();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue & Capacity</CardTitle>
        <CardDescription>
          Set where your event takes place and how many people can attend.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Shadcn Combobox for Venue */}
        <Controller
          name="eventVenueId"
          control={control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="flex flex-col gap-2"
            >
              <FieldLabel htmlFor={field.name}>Event Venue</FieldLabel>
              <FieldContent>
                <Combobox
                  items={venues}
                  itemToStringValue={(venue: Venue) => venue.venue_name}
                  value={
                    venues.find((venue: Venue) => venue.id === field.value)
                      ?.venue_name ?? null
                  }
                  onValueChange={(venue: Venue | null) =>
                    form.setValue(
                      "eventVenueId",
                      venue?.id as CreateEventFormValues["eventVenueId"],
                      { shouldValidate: true },
                    )
                  }
                >
                  <ComboboxInput
                    className="focus-within:border-none focus-visible:border-none border border-gray-300"
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    disabled={isLoadingVenues}
                    placeholder={
                      isLoadingVenues
                        ? "Loading venues..."
                        : "Select a venue..."
                    }
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
                {/* <FieldDescription>
                  Search and select the registered venue.
                </FieldDescription> */}
              </FieldContent>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="capacity"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Total Capacity</FieldLabel>
              <div className="relative ">
                <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min="1"
                  aria-invalid={fieldState.invalid}
                  className="pl-9"
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
};
