import { Controller, useFormContext } from "react-hook-form";
import { UsersIcon } from "lucide-react";
import { type CreateEventFormValues } from "@/types/organizer/event.schema";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CategorySelect } from "./CategorySelect";
// import { HeadingButton } from "@/components/tiptap-ui/heading-button";
// import { MenuBar } from "@/components/shared/editor-header";
import { DescriptionField } from "@/components/shared/richtext-editor";
import { useIsMobile } from "@/hooks/use-mobile";
// import { DescriptionEditor } from "@/components/shared/richtext-editor";

export function EventBasicFields() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CreateEventFormValues>();

  const { watch } = useFormContext<CreateEventFormValues>();
  console.log("title now:", watch("title"));
  

  const { isMobile } = useIsMobile();

  return (
    <>
      <div className="space-y-4">
        <Field data-invalid={!!errors.title}>
          <FieldLabel htmlFor="title">
            Event Title <span className="text-destructive">*</span>
          </FieldLabel>
          <Input
            {...register("title")}
            id="title"
            placeholder="e.g. Summer Music Festival 2026"
          />
          {errors.title && <FieldError errors={[errors.title]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="description">
            Event Description<span className="text-destructive">*</span>
          </FieldLabel>

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <DescriptionField
                value={field.value as string}
                onChange={field.onChange}
              />
            )}
          />

          {errors.description && <FieldError errors={[errors.description]} />}
        </Field>
        <CategorySelect />

        <div className={`flex gap-4 ${isMobile && `flex flex-col`}`}>
          <Field data-invalid={!!errors.dateAndTime || !!errors.dateAndTimeEnd}>
            <FieldLabel htmlFor="dateAndTime">Date and Time</FieldLabel>
            <div
              className={`gap-4 ${isMobile ? `flex flex-col w-full` : `flex`}`}
            >
              <div className={`  ${!isMobile && `max-w-1/2`}`}>
                <span className="flex gap-1">
                  Start<span className="text-destructive">*</span>
                </span>

                <Input
                  {...register("dateAndTime")}
                  id="dateAndTime"
                  type="datetime-local"
                  className="pl-9"
                />
              </div>
              <div className={`  ${!isMobile && `max-w-1/2`}`}>
                <span className="flex gap-1">
                  End<span className="text-destructive">*</span>
                </span>
                <Input
                  {...register("dateAndTimeEnd")}
                  id="dateAndTimeEnd"
                  type="datetime-local"
                  className="pl-9"
                />
              </div>
            </div>
            {errors.dateAndTime && <FieldError errors={[errors.dateAndTime]} />}
            {errors.dateAndTimeEnd && (
              <FieldError errors={[errors.dateAndTimeEnd]} />
            )}
          </Field>

          {/* <Field data-invalid={!!errors.eventVenueId}>
          <FieldLabel htmlFor="eventVenueId">
            Event Venue <span className="text-destructive">*</span>
          </FieldLabel>
          <FieldContent>
            <div className="flex items-start gap-2">
              <div className="max-w-55 flex-1 min-w-0">
                <Controller
                  name="eventVenueId"
                  control={control}
                  render={({ field }) => (
                    <Combobox
                      items={venues}
                      itemToStringLabel={(v: Venue) => v.venue_name}
                      itemToStringValue={(v: Venue) => v.venue_name}
                      value={
                        venues.find((v: Venue) => v.id === field.value) ?? null
                      }
                      onValueChange={(venue: Venue | null) => {
                        field.onChange(venue ? venue.id : undefined);
                      }}
                    >
                      <ComboboxInput
                        className="border border-border focus-within:border-none focus-visible:border-none"
                        id="eventVenueId"
                        disabled={isLoading}
                        placeholder={
                          isLoading ? "Loading..." : "Select a venue"
                        }
                        onBlur={field.onBlur}
                      />
                      <ComboboxContent>
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
                  )}
                />
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
          onSuccess={(venue) =>
          setValue("eventVenueId", venue.id, { shouldValidate: true })
          }
          /> */}
        </div>
        <Field data-invalid={!!errors.capacity}>
          <FieldLabel htmlFor="capacity">
            Total Capacity<span className="text-destructive">*</span>
          </FieldLabel>
          <div className={`relative ${!isMobile && `max-w-55`}`}>
            <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("capacity", { valueAsNumber: true })}
              id="capacity"
              type="number"
              min="1"
              className="pl-9"
            />
          </div>
          {errors.capacity && <FieldError errors={[errors.capacity]} />}
        </Field>
      </div>
    </>
  );
}
