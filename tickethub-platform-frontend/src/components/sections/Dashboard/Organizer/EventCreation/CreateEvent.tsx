import { useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, PlusIcon } from "lucide-react";

import {
  createEventSchema,
  type CreateEventFormValues,
} from "@/types/organizer/event.schema";
import { useCreateOrganizerEventWithTickets } from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerMedia } from "@/hooks/organizers/useOrganizerMedia";
import type { TicketPayload } from "@/utils/services/organizers/events.service";
import { toEventApiDate } from "@/utils/eventDate";
import { richTextOrUndefined } from "@/utils/richText";
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
import { TicketDialog } from "./TicketDialog";
import { TicketList } from "./TicketList";
import VenueForm from "./VenueForm";

export function firstErrorMessage(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  if ("message" in obj && typeof obj.message === "string") return obj.message;
  for (const value of Object.values(obj)) {
    const found = firstErrorMessage(value);
    if (found) return found;
  }
  return undefined;
}
import EventSteps from "./EventSteps";
import { useScrollSpy } from "../../../../shared/scroll-spy";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [ticketOpen, setTicketOpen] = useState(false);
  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useOrganizerMedia();
  const { mutateAsync: createEvent, isPending: isCreating } =
    useCreateOrganizerEventWithTickets();
  // const { data: venues = [], isLoading } = useEventVenues();
  // const [venueDialogOpen, setVenueDialogOpen] = useState(false);

  const STEP_IDS = ["step-0", "step-1", "step-2", "step-3"];

  // inside the component
  const step = useScrollSpy(STEP_IDS);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventVenueId: undefined,
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

  const ticketFieldArray = useFieldArray({
    control: form.control,
    name: "tickets",
  });

  const { fields, remove } = ticketFieldArray;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  function onInvalid(errors: unknown) {
    toast.error(
      firstErrorMessage(errors) ?? "Please fix the highlighted fields.",
    );
  }

  const submitForm = form.handleSubmit(onSubmit, onInvalid);

  async function onSubmit(values: CreateEventFormValues) {
    try {
      const [{ url }] = await uploadMedia([values.bannerImage]);
      if (!url) throw new Error("Upload failed");

      const tickets: TicketPayload[] = values.tickets.map((t) => ({
        ...(t.ticketTypeName ? { ticketTypeName: t.ticketTypeName } : {}),
        price: t.price,
        ...(t.totalCount ? { totalCount: t.totalCount } : {}),
        ...(t.benefits ? { benefits: t.benefits } : {}),
        ...(toEventApiDate(t.salesStartDate)
          ? { salesStartDate: toEventApiDate(t.salesStartDate) }
          : {}),
        ...(toEventApiDate(t.salesEndDate)
          ? { salesEndDate: toEventApiDate(t.salesEndDate) }
          : {}),
      }));

      const result = (await createEvent({
        title: values.title,
        description: richTextOrUndefined(values.description),
        ...(values.eventVenueId
          ? { eventVenueId: values.eventVenueId }
          : {
              venue: {
                venue_name: values.venue.venue_name.trim(),
                address: values.venue.address?.trim() || undefined,
                city_or_town: values.venue.city_or_town.trim(),
                country: values.venue.country.trim(),
                googleMapLink: values.venue.googleMapLink?.trim() || undefined,
              },
            }),
        capacity: values.capacity,
        dateAndTime: toEventApiDate(values.dateAndTime) ?? "",
        dateAndTimeEnd: toEventApiDate(values.dateAndTimeEnd),
        termsAndConditions: values.termsAndConditions?.trim()
          ? values.termsAndConditions
          : DEFAULT_EVENT_TERMS,
        categoryIds: values.categoryIds,
        media: [{ imageUrl: url, type: "Banner" }],
        tickets,
      })) as { data?: { status?: string } } | undefined;

      toast.success(
        result?.data?.status === "Published"
          ? "Event created and published!"
          : "Event and tickets created! Pending review.",
      );
      navigate("/organizer/events");
    } catch {
      toast.error("Failed to create event. Please try again.");
    }
  }

  const [stepper, setStep] = useState<string | number>();
  console.log(stepper);

  return (
    <div className="">
      <FormProvider {...form}>
        <div className="flex min-h-screen flex-col pb-30">
          <EventSteps
            currentStep={step}
            onStepClick={(i) => {
              setStep(i);
              document
                .getElementById(`step-${i}`)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          />
          <form onSubmit={submitForm} className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 gap-4  p-2">
              <div className="space-y-4 md:col-span-2">
                {/* Step 1: Event Details */}
                <div
                  id="step-0"
                  className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-7 gap-2 items-start"
                >
                  <Card className="col-span-5">
                    <CardContent className="pt-4">
                      <EventBasicFields />
                    </CardContent>
                  </Card>

                  <div className="col-span-2 ">
                    <MediaUploadCard
                      control={form.control}
                      imagePreview={imagePreview}
                      setImagePreview={setImagePreview}
                    />
                  </div>
                </div>
                {/* Step 2: Venue */}
                <Card id="step-1" className="scroll-mt-24">
                  <CardTitle className="px-4">
                    Event Location information
                  </CardTitle>
                  <CardDescription className="px-4">
                    Enter information on where the event will be hosted
                  </CardDescription>
                  <CardContent className="pt-4">
                    <VenueForm
                    // onOpenChange={venueDialogOpen}
                    // onSuccess={(venue) =>
                    //   setValue("eventVenueId", venue.id, { shouldValidate: true })
                    // }
                    />
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-4">
                  {/* Step 3: Tickets */}
                  <Card id="step-2" className="scroll-mt-24">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        Tickets ({fields.length}){" "}
                        <span className="text-destructive">*</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2">
                        <TicketList
                          fields={fields}
                          onEdit={() => setTicketOpen(true)}
                          onRemove={(i) => remove(i)}
                        />
                      </div>
                      {typeof form.formState.errors.tickets?.message ===
                        "string" && (
                        <p className="mb-2 text-xs text-destructive">
                          {form.formState.errors.tickets.message}
                        </p>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setTicketOpen(true)}
                      >
                        <PlusIcon className="mr-1 h-4 w-4" /> Add Ticket
                      </Button>
                    </CardContent>
                  </Card>
                  {/* Step 4: Publish */}
                  <div id="step-3" className="scroll-mt-24 flex flex-col gap-4">
                    <TermsCard control={form.control} />
                    <Button
                      type="button"
                      onClick={submitForm}
                      disabled={isUploading || isCreating}
                      className={"w-full"}
                    >
                      {(isUploading || isCreating) && (
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                      )}
                      {isUploading || isCreating
                        ? "Creating..."
                        : "Create Event"}
                    </Button>
                  </div>
                </div>
              </div>

              {/* <div className="space-y-4 md:col-span-1"></div> */}
            </div>
          </form>
        </div>

        <TicketDialog
          open={ticketOpen}
          onOpenChange={setTicketOpen}
          fieldArray={ticketFieldArray}
          onSubmit={submitForm}
          isSubmitting={isUploading || isCreating}
        />
      </FormProvider>
    </div>
  );
}


