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
import {
  useCreateOrganizerEventWithTickets,
  useEventVenues,
} from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerMedia } from "@/hooks/organizers/useOrganizerMedia";
import type { TicketPayload } from "@/utils/services/organizers/events.service";

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

export default function CreateEvent() {
  const navigate = useNavigate();
  const [ticketOpen, setTicketOpen] = useState(false);
  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useOrganizerMedia();
  const { mutateAsync: createEvent, isPending: isCreating } =
    useCreateOrganizerEventWithTickets();
  // const { data: venues = [], isLoading } = useEventVenues();
  // const [venueDialogOpen, setVenueDialogOpen] = useState(false);

  const form = useForm<CreateEventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventVenueId: undefined,
      capacity: undefined,
      dateAndTime: "",
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

  const { fields } = ticketFieldArray;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const DEFAULT_TERMS =
    "By purchasing a ticket, you agree to abide by the event organizer's policies. All sales are final unless otherwise stated.";

  async function onSubmit(values: CreateEventFormValues) {
    try {
      const [{ url }] = await uploadMedia([values.bannerImage]);
      if (!url) throw new Error("Upload failed");

      const tickets: TicketPayload[] = values.tickets.map((t) => ({
        name: t.name,
        ...(t.ticketTypeId ? { ticketTypeId: t.ticketTypeId } : {}),
        price: t.price,
        ...(t.totalCount ? { totalCount: t.totalCount } : {}),
        ...(t.benefits ? { benefits: t.benefits } : {}),
      }));

      await createEvent({
        title: values.title,
        description: values.description || undefined,
        eventVenueId: values.eventVenueId,
        capacity: values.capacity,
        dateAndTime: new Date(values.dateAndTime).toISOString(),
        termsAndConditions: values.termsAndConditions?.trim()
          ? values.termsAndConditions
          : DEFAULT_TERMS,
        categoryIds: values.categoryIds,
        media: [{ imageUrl: url, type: "Banner" }],
        tickets,
      });

      toast.success("Event and tickets created!");
      navigate("/organizer/events");
    } catch {
      toast.error("Failed to create event. Please try again.");
    }
  }

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col pb-30">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto"
        >
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
                  <VenueForm
                  // onOpenChange={venueDialogOpen}
                  // onSuccess={(venue) =>
                  //   setValue("eventVenueId", venue.id, { shouldValidate: true })
                  // }
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 md:col-span-1">
              <MediaUploadCard
                control={form.control}
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
                  <div className="mb-2">
                    <TicketList
                      fields={fields}
                      onEdit={() => setTicketOpen(true)}
                      onRemove={() => setTicketOpen(true)}
                    />
                  </div>
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
              <TermsCard control={form.control} />
              <Button
                type="button"
                onClick={form.handleSubmit(onSubmit)}
                disabled={isUploading || isCreating}
                className={"w-full"}
              >
                {(isUploading || isCreating) && (
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                )}
                {isUploading || isCreating ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <TicketDialog
        open={ticketOpen}
        onOpenChange={setTicketOpen}
        fieldArray={ticketFieldArray}
        onSubmit={form.handleSubmit(onSubmit)}
        isSubmitting={isUploading || isCreating}
      />
    </FormProvider>
  );
}
