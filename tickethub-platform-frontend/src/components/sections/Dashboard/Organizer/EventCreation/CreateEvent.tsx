import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createEventSchema,
  type CreateEventFormValues,
} from "@/types/organizer/event.schema";
import { useCreateOrganizerEvent } from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerMedia } from "@/hooks/organizers/useOrganizerMedia";
import { type CreateEventPayload } from "@/utils/services/organizers/events.service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Sub-components
import { BasicInfoCard } from "./BasicInfoCard";
import { VenueAndCapacityCard } from "./VenueAndCapacityCard";
import { TermsCard } from "./TermsCard";
import { MediaUploadCard } from "./MediaUpload";

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
      eventVenueId: undefined, // Changed to undefined to force selection
      capacity: 100,
      dateAndTime: "",
      termsAndConditions: "",
      bannerImage: undefined,
      galleryImages: [],
      sponsorImages: [],
    },
  });

  const onSubmit = async (values: CreateEventFormValues) => {
    try {
      const uploadResponse = await uploadMedia([values.bannerImage as File]);
      const uploadedImageUrl = uploadResponse[0].url;

      if (!uploadedImageUrl)
        throw new Error("Failed to retrieve uploaded image URL");

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

      await createEvent(payload);

      toast.success("Event created successfully!");
      navigate("/organizer/events");
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
            <BasicInfoCard control={form.control} />
            <VenueAndCapacityCard control={form.control} form={form} />
            <TermsCard control={form.control} />
          </div>

          {/* RIGHT COLUMN - MEDIA & ACTIONS */}
          <div className="space-y-6 md:col-span-1">
            <MediaUploadCard
              control={form.control}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />

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
