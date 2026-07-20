import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import {
  CalendarIcon,
  ImageIcon,
  MapPinIcon,
  UsersIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  createEventSchema,
  type CreateEventFormValues,
} from "@/types/organizer/event.schema";
import { useCreateOrganizerEvent } from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerMedia } from "@/hooks/organizers/useOrganizerMedia";
import { type CreateEventPayload } from "@/utils/services/organizers/events.service";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mutations
  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useOrganizerMedia();
  const { mutateAsync: createEvent, isPending: isCreating } =
    useCreateOrganizerEvent();

  // Form Setup
  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),

    defaultValues: {
      title: "",
      description: "",
      eventVenueId: 1,
      capacity: 100,
      dateAndTime: "",
      termsAndConditions: "",
      bannerImage: undefined,
      galleryImages: [],
      sponsorImages: [],
    },
  });

  // Orchestrate the submission flow
  const onSubmit = async (values: CreateEventFormValues) => {
    try {
      // Upload Media
      const uploadResponse = await uploadMedia([values.bannerImage as File]);

      const uploadedImageUrl = uploadResponse[0].url;

      if (!uploadedImageUrl)
        throw new Error("Failed to retrieve uploaded image URL");

      // 2. Prepare Payload
      const payload: CreateEventPayload = {
        title: values.title as string,
        description: values.description as string,
        eventVenueId: values.eventVenueId as number,
        capacity: values.capacity as number,
        dateAndTime: new Date(values.dateAndTime as string).toISOString(),
        termsAndConditions: values.termsAndConditions,
        media: [
          {
            imageUrl: uploadedImageUrl,
            type: "Banner",
          },
        ],
      };

      // 3. Create Event
      await createEvent(payload);

      toast.success("Event created successfully!");
      navigate("/organizer/events"); // Redirect to events list
    } catch (error) {
      console.error(error);
      toast.error("Failed to create event. Please try again.");
    }
  };

  const isSubmitting = isUploading || isCreating;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create New Event</h2>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* LEFT COLUMN - MAIN DETAILS */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the core details about your upcoming event.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Event Title</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. Summer Music Festival 2026"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                      <Textarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Tell attendees what to expect..."
                        className="min-h-30"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Controller
                    name="dateAndTime"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>
                          Date and Time
                        </FieldLabel>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id={field.name}
                            type="datetime-local"
                            aria-invalid={fieldState.invalid}
                            className="pl-9"
                          />
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Venue & Capacity</CardTitle>
                <CardDescription>
                  Set where your event takes place and how many people can
                  attend.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="eventVenueId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Venue ID</FieldLabel>
                      <FieldContent>
                        <div className="relative">
                          <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id={field.name}
                            type="number"
                            min="1"
                            aria-invalid={fieldState.invalid}
                            className="pl-9"
                            onChange={(e) =>
                              field.onChange(e.target.valueAsNumber)
                            }
                          />
                        </div>
                        <FieldDescription>
                          Select the registered venue.
                        </FieldDescription>
                      </FieldContent>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="capacity"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Total Capacity
                      </FieldLabel>
                      <div className="relative">
                        <UsersIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          id={field.name}
                          type="number"
                          min="1"
                          aria-invalid={fieldState.invalid}
                          className="pl-9"
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber)
                          }
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Terms & Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <Controller
                  name="termsAndConditions"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <Textarea
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="e.g. No refunds within 24 hours of the event..."
                        className="min-h-25"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN - MEDIA & ACTIONS */}
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Event Media</CardTitle>
                <CardDescription>
                  Upload a stunning banner to attract attendees.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Controller
                  name="bannerImage"
                  control={form.control}
                  render={({ field, fieldState }) => {
                    const { onChange, onBlur, name } = field; // don't use field.value on the input

                    return (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={name}>Banner Image</FieldLabel>
                        <FieldContent>
                          <div className="flex flex-col items-center justify-center gap-4">
                            {imagePreview ? (
                              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 hover:bg-muted transition-colors">
                                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground">
                                  Select an image
                                </span>
                              </div>
                            )}
                            <Input
                              type="file"
                              id={name}
                              name={name}
                              accept="image/png, image/jpeg, image/webp"
                              aria-invalid={fieldState.invalid}
                              className="cursor-pointer"
                              onBlur={onBlur}
                              // Treat as uncontrolled: no value prop
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  onChange(file); // store File in RHF
                                  setImagePreview(URL.createObjectURL(file));
                                } else {
                                  onChange(undefined);
                                  setImagePreview(null);
                                }
                              }}
                            />
                          </div>
                          <FieldDescription>
                            Max size: 5MB. Formats: JPG, PNG, WEBP.
                          </FieldDescription>
                        </FieldContent>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    );
                  }}
                />
              </CardContent>
            </Card>

            {/* ACTIONS CARD */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isUploading ? "Uploading Media..." : "Creating Event..."}
                    </>
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
