import { useEffect, useState } from "react";
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  editEventSchema,
  type CreateEventFormValues,
  type EditEventFormValues,
  type TicketFormValues,
} from "@/types/organizer/event.schema";
import {
  useOrganizerEvent,
  useUpdateOrganizerEvent,
} from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerMedia } from "@/hooks/organizers/useOrganizerMedia";
import type {
  OrganizerEventDetail,
  UpdateEventPayload,
} from "@/utils/services/organizers/events.service";
import { toEventApiDate, toEventFormDate } from "@/utils/eventDate";
import { richTextOrNull } from "@/utils/richText";
import { DEFAULT_EVENT_TERMS } from "@/utils/eventTerms";
import { normalizeGoogleMapLink } from "@/utils/googleMapLink";
import { useScrollSpy } from "@/components/shared/scroll-spy";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { EventBasicFields } from "./EventBasicFields";
import { EditTicketsSection } from "./EditTicketsSection";
import EventSteps from "./EventSteps";
import { firstErrorMessage } from "./CreateEvent";
import { MediaUploadCard } from "./MediaUpload";
import { TermsCard } from "./TermsCard";
import VenueForm from "./VenueForm";

type SharedControl = Control<CreateEventFormValues>;
type EventEnvelope = OrganizerEventDetail & { data?: OrganizerEventDetail };

const EDIT_STEP_IDS = ["edit-step-0", "edit-step-1", "edit-step-2", "edit-step-3"];
const EDIT_STEPS = ["Event Details", "Venue", "Tickets", "Save"];

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

function unwrapEvent(detail: OrganizerEventDetail): OrganizerEventDetail {
  return (detail as EventEnvelope).data ?? detail;
}

function getBannerUrl(event: OrganizerEventDetail) {
  return event.media?.find((m) => m.type === "Banner")?.imageUrl ?? null;
}

function toFormValues(src: OrganizerEventDetail): EditEventFormValues {
  return {
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
        id: t.id,
        ticketTypeName: t.ticketType ?? t.name ?? `Ticket type ${index + 1}`,
        price: Number(t.price),
        totalCount: t.totalCount ?? undefined,
        totalSold: t.totalSold ?? 0,
        remaining: t.remaining ?? 0,
        benefits: t.benefits ?? undefined,
        isVisible: t.isVisible ?? true,
        salesStartDate: toEventFormDate(t.salesStartDate) || undefined,
        salesEndDate: toEventFormDate(t.salesEndDate) || undefined,
      }),
    ),
  };
}

interface Props {
  eventId: string | number;
}

export default function EditEvent({ eventId }: Props) {
  const navigate = useNavigate();
  const { data: detail, isLoading, isError } = useOrganizerEvent(eventId);

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (isError || !detail) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Event not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/organizer/events")}>Back to events</Button>
      </div>
    );
  }

  const src = unwrapEvent(detail);
  return <EditEventForm key={`${src.id}-${src.updatedAt ?? "initial"}`} eventId={eventId} event={src} />;
}

function EditEventForm({ eventId, event }: { eventId: string | number; event: OrganizerEventDetail }) {
  const navigate = useNavigate();
  const activeStep = useScrollSpy(EDIT_STEP_IDS);
  const { mutateAsync: uploadMedia, isPending: isUploading } = useOrganizerMedia();
  const { mutateAsync: updateEvent, isPending: isSaving } = useUpdateOrganizerEvent();
  const bannerUrl = getBannerUrl(event);
  const [imagePreview, setImagePreview] = useState<string | null>(bannerUrl);
  const [originalBanner, setOriginalBanner] = useState<File | null>(null);
  const [deletedTicketIds, setDeletedTicketIds] = useState<number[]>([]);

  const form = useForm<EditEventFormValues>({
    resolver: zodResolver(editEventSchema),
    defaultValues: toFormValues(event),
  });

  const ticketFieldArray = useFieldArray({ control: form.control, name: "tickets", keyName: "fieldId" });
  const { isDirty } = form.formState;
  const currentBanner = useWatch({ control: form.control, name: "bannerImage" });
  const bannerChanged = !!currentBanner && currentBanner !== originalBanner;
  const canSave = isDirty || bannerChanged || deletedTicketIds.length > 0;

  useEffect(() => {
    if (!bannerUrl) {
      setImagePreview(null);
      setOriginalBanner(null);
      return;
    }

    let cancelled = false;
    setImagePreview(bannerUrl);
    urlToFile(bannerUrl).then((file) => {
      if (!cancelled && file) {
        setOriginalBanner(file);
        form.resetField("bannerImage", { defaultValue: file });
        form.trigger("bannerImage");
      }
    });

    return () => { cancelled = true; };
  }, [bannerUrl, form]);

  function onInvalid(errors: unknown) {
    toast.error(firstErrorMessage(errors) ?? "Please fix the highlighted fields.");
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
        termsAndConditions: values.termsAndConditions?.trim() ? values.termsAndConditions : DEFAULT_EVENT_TERMS,
        categoryIds: values.categoryIds,
        tickets: {
          upsert: (values.tickets ?? []).map((ticket) => ({
            id: ticket.id,
            ticketTypeName: ticket.ticketTypeName.trim(),
            price: Number(ticket.price),
            totalCount: ticket.totalCount ? Number(ticket.totalCount) : undefined,
            salesStartDate: toEventApiDate(ticket.salesStartDate) ?? undefined,
            salesEndDate: toEventApiDate(ticket.salesEndDate) ?? undefined,
            benefits: ticket.benefits?.trim() || undefined,
            isVisible: ticket.isVisible ?? true,
          })),
          deleteIds: deletedTicketIds,
        },
      };

      if (values.venue?.venue_name?.trim()) {
        payload.venue = {
          venue_name: values.venue.venue_name.trim(),
          address: values.venue.address?.trim() || null,
          city_or_town: values.venue.city_or_town.trim(),
          country: values.venue.country.trim(),
          googleMapLink: normalizeGoogleMapLink(values.venue.googleMapLink) ?? null,
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
    } catch (err) {
      console.error("[EditEvent] update failed:", err);
      toast.error("Failed to update event. Please try again.");
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col pb-32">
        <EventSteps
          currentStep={activeStep}
          steps={EDIT_STEPS}
          onStepClick={(index) => document.getElementById(EDIT_STEP_IDS[index])?.scrollIntoView({ behavior: "smooth" })}
        />
        <form onSubmit={submitForm} className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-4 p-2">
            <div className="space-y-4">
              <div id="edit-step-0" className="scroll-mt-24 space-y-4">
                <Card><CardContent className="pt-4"><EventBasicFields /></CardContent></Card>
                <MediaUploadCard control={form.control as unknown as SharedControl} imagePreview={imagePreview} setImagePreview={setImagePreview} />
              </div>
              <Card id="edit-step-1" className="scroll-mt-24">
                <CardTitle className="px-4">Event Location information</CardTitle>
                <CardDescription className="px-4">Enter information on where the event will be hosted</CardDescription>
                <CardContent className="pt-4"><VenueForm /></CardContent>
              </Card>
              <div id="edit-step-2" className="scroll-mt-24">
                <EditTicketsSection fieldArray={ticketFieldArray} onDeleteExisting={(ticketId) => setDeletedTicketIds((ids) => [...new Set([...ids, ticketId])])} />
              </div>
              <div id="edit-step-3" className="scroll-mt-24 space-y-4">
                <TermsCard control={form.control as unknown as SharedControl} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate("/organizer/events")}>Cancel</Button>
                  <Button type="button" onClick={submitForm} disabled={isUploading || isSaving || !canSave} className="flex-1">
                    {(isUploading || isSaving) && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                    {isUploading || isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
