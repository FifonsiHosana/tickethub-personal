import { useEffect, useState } from "react";
import {
  useForm,
  useWatch,
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
import { normalizeGoogleMapLink } from "@/utils/googleMapLink";

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

// Walks RHF's dirtyFields map and returns only the values that changed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickDirty(dirty: unknown, values: any): any {
  if (dirty === true) return values;
  if (Array.isArray(dirty)) {
    return dirty.map((d, i) => pickDirty(d, values?.[i]));
  }
  if (dirty && typeof dirty === "object") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: Record<string, any> = {};
    for (const key of Object.keys(dirty)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = pickDirty((dirty as any)[key], values?.[key]);
      if (v !== undefined) out[key] = v;
    }
    return Object.keys(out).length ? out : undefined;
  }
  return undefined;
}

interface Props {
  eventId: string | number;
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

  // Reading these during render subscribes the component to dirty state.
  const { isDirty, dirtyFields } = form.formState;
  const currentBanner = useWatch({
    control: form.control,
    name: "bannerImage",
  });
  const bannerChanged = !!currentBanner && currentBanner !== originalBanner;
  const canSave = isDirty || bannerChanged;

  useEffect(() => {
    if (!detail) return;
    let cancelled = false;

    console.log("[EditEvent] form.reset from detail", {
      wasDirty: form.formState.isDirty,
      detail,
    });

    // Accept both the unwrapped event and the raw { success, data } envelope
    // so prefilling never silently blanks when layers drift.
    const src =
      (detail as OrganizerEventDetail & { data?: OrganizerEventDetail }).data ??
      detail;
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
        (t, index): TicketFormValues => ({
          ticketTypeName: t.ticketType ?? `Ticket type ${index + 1}`,
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
          // Sets BOTH the value and the default, so the form stays clean.
          form.resetField("bannerImage", { defaultValue: file });
          form.trigger("bannerImage");
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [detail, form]);

  console.log(dirtyFields);

  function onInvalid(errors: unknown) {
    console.log(
      "[EditEvent] validation errors:",
      errors,
      "dirty:",
      form.formState.dirtyFields,
    );
    toast.error(
      firstErrorMessage(errors) ?? "Please fix the highlighted fields.",
    );
  }

  const submitForm = form.handleSubmit(onSubmit, onInvalid);

  async function onSubmit(values: EditEventFormValues) {
    const currentDirty = form.formState.dirtyFields;
    console.groupCollapsed("[EditEvent] submit");
    console.log("dirtyFields:", currentDirty);
    console.log("dirty values:", pickDirty(currentDirty, values));
    console.log("bannerChanged:", bannerChanged);

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
          googleMapLink:
            normalizeGoogleMapLink(values.venue.googleMapLink) ?? null,
        };
      }

      if (values.bannerImage && values.bannerImage !== originalBanner) {
        const [{ url }] = await uploadMedia([values.bannerImage]);
        if (!url) throw new Error("Upload failed");
        payload.media = [{ imageUrl: url, type: "Banner" }];
      }

      console.log("payload:", payload);
      await updateEvent({ eventId, payload });
      console.groupEnd();
      toast.success("Event updated!");
      navigate("/organizer/events");
    } catch (err) {
      console.error("[EditEvent] update failed:", err);
      console.groupEnd();
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
                  disabled={isUploading || isSaving || !canSave}
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
