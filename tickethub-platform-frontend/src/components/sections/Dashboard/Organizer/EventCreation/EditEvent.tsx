import { useEffect, useState } from "react";
import {
  useForm,
  FormProvider,
  useFieldArray,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  editEventSchema,
  type EditEventFormValues,
  type TicketFormValues,
  type CreateEventFormValues,
} from "@/types/organizer/event.schema";
import {
  useOrganizerEvent,
  useUpdateOrganizerEvent,
} from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerMedia } from "@/hooks/organizers/useOrganizerMedia";
import type {
  UpdateEventPayload,
  OrganizerEventDetail,
} from "@/utils/services/organizers/events.service";
import { toEventApiDate, toEventFormDate } from "@/utils/eventDate";
import { richTextOrNull } from "@/utils/richText";
import { DEFAULT_EVENT_TERMS } from "@/utils/eventTerms";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { EventBasicFields } from "./EventBasicFields";
import { TermsCard } from "./TermsCard";
import { MediaUploadCard } from "./MediaUpload";
import { TicketList } from "./TicketList";
import VenueForm from "./VenueForm";
import { firstErrorMessage } from "./CreateEvent";

// Shared section components are typed for the create form; the edit form
// carries the same field names with relaxed optionality.
type SharedControl = Control<CreateEventFormValues>;

async function urlToFile(url: string): Promise<File | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const blob = await res.blob();
    return new File([blob], "banner", { type: blob.type || "image/jpeg" });
  } catch {
    return undefined;
  }
}

interface Props {
  eventId: number;
}

export default function EditEvent({ eventId }: Props) {
  const navigate = useNavigate();
  const { data: detail, isLoading, isError } = useOrganizerEvent(eventId);
  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useOrganizerMedia();
  const { mutateAsync: updateEvent, isPending: isSaving } =
    useUpdateOrganizerEvent();

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: "",
      description: "",
      venue: {
        venue_name: "",
        address: "",
        city_or_town: "",
        country: "",
        googleMapLink: "",
      },
      capacity: undefined,
      dateAndTime: "",
      dateAndTimeEnd: "",
      termsAndConditions: "",
      categoryIds: [],
      bannerImage: undefined,
      tickets: [],
    },
  });

  const { fields } = useFieldArray({ control: form.control, name: "tickets" });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalBanner, setOriginalBanner] = useState<File | null>(null);

  useEffect(() => {
    if (!detail) return;
    let cancelled = false;
    // Accept both the unwrapped event and the raw { success, data } envelope
    // so prefilling never silently blanks when layers drift.
    const src = (detail as OrganizerEventDetail & { data?: OrganizerEventDetail })
      .data ?? detail;
    const bannerUrl = src.media?.find((m) => m.type === "Banner")?.imageUrl;

    form.reset({
      title: src.title ?? "",
      description: src.description ?? "",
      eventVenueId: src.eventVenueId ?? undefined,
      venue: src.venue
        ? {
            venue_name: src.venue.venue_name ?? "",
            address: src.venue.address ?? "",
            city_or_town: src.venue.city_or_town ?? "",
            country: src.venue.country ?? "",
            googleMapLink: src.venue.googleMapLink ?? "",
          }
        : undefined,
      capacity: src.capacity,
      dateAndTime: toEventFormDate(src.dateAndTime),
      dateAndTimeEnd: toEventFormDate(src.dateAndTimeEnd),
      termsAndConditions: src.termsAndConditions ?? "",
      categoryIds: src.categoryIds ?? [],
      bannerImage: undefined,
      tickets: (src.tickets ?? []).map(
        (t): TicketFormValues => ({
          name: t.name,
          ticketTypeId: t.ticketTypeId ?? undefined,
          price: Number(t.price),
          totalCount: t.totalCount ?? undefined,
          benefits: t.benefits ?? undefined,
          salesStartDate: toEventFormDate(t.salesStartDate) || undefined,
          salesEndDate: toEventFormDate(t.salesEndDate) || undefined,
        }),
      ),
    });
    setImagePreview(bannerUrl ?? null);

    if (bannerUrl) {
      urlToFile(bannerUrl).then((file) => {
        if (!cancelled && file) {
          setOriginalBanner(file);
          form.setValue("bannerImage", file, { shouldValidate: true });
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [detail, form]);

  function onInvalid(errors: unknown) {
    toast.error(
      firstErrorMessage(errors) ?? "Please fix the highlighted fields.",
    );
  }

  const submitForm = form.handleSubmit(onSubmit, onInvalid);

  async function onSubmit(values: EditEventFormValues) {
    try {
      const payload: UpdateEventPayload = {
        title: values.title,
        description: richTextOrNull(values.description),
        capacity: values.capacity,
        dateAndTime: toEventApiDate(values.dateAndTime) ?? "",
        dateAndTimeEnd: toEventApiDate(values.dateAndTimeEnd) ?? null,
        termsAndConditions: values.termsAndConditions?.trim()
          ? values.termsAndConditions
          : DEFAULT_EVENT_TERMS,
        categoryIds: values.categoryIds,
      };

      if (values.venue?.venue_name?.trim()) {
        payload.venue = {
          venue_name: values.venue.venue_name.trim(),
          address: values.venue.address?.trim() || null,
          city_or_town: values.venue.city_or_town.trim(),
          country: values.venue.country.trim(),
          googleMapLink: values.venue.googleMapLink?.trim() || null,
        };
      }

      if (values.bannerImage && values.bannerImage !== originalBanner) {
        const [{ url }] = await uploadMedia([values.bannerImage]);
        if (!url) throw new Error("Upload failed");
        payload.media = [{ imageUrl: url, type: "Banner" }];
      }

      await updateEvent({ eventId, payload });
      toast.success("Event updated!");
      navigate("/organizer/events");
    } catch {
      toast.error("Failed to update event. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/organizer/events")}
        >
          Back to events
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col pb-30">
        <form onSubmit={submitForm} className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 p-2">
            <div className="space-y-4 md:col-span-2">
              <Card>
                <CardContent className="pt-4">
                  <EventBasicFields />
                </CardContent>
              </Card>
              <Card>
                <CardTitle className="px-4">
                  Event Location information
                </CardTitle>
                <CardDescription className="px-4">
                  Enter information on where the event will be hosted
                </CardDescription>
                <CardContent className="pt-4">
                  <VenueForm />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 md:col-span-1">
              <MediaUploadCard
                control={form.control as unknown as SharedControl}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
              />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Tickets ({fields.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TicketList fields={fields} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Ticket types are managed from the Ticket Types page.
                  </p>
                </CardContent>
              </Card>
              <TermsCard control={form.control as unknown as SharedControl} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/organizer/events")}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={submitForm}
                  disabled={isUploading || isSaving}
                  className="flex-1"
                >
                  {(isUploading || isSaving) && (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  )}
                  {isUploading || isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
