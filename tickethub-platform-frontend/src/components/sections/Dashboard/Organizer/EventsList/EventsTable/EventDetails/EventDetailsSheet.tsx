import { useOrganizerEvent } from "@/hooks/organizers/useOrganizerEvents";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Loader2Icon } from "lucide-react";
import { EventBanner } from "./EventBanner";
import { EventStats } from "./EventStats";
import { EventTickets } from "./EventTickets";
import { EventAbout } from "./EventAbout";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: number | null;
}

export function EventDetailsSheet({ open, onOpenChange, eventId }: Props) {
  const { data, isLoading } = useOrganizerEvent(eventId ?? 0);
  const event = data?.data ?? data;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-2 sr-only">
          <SheetTitle>Event Details</SheetTitle>
          <SheetDescription>
            Full information about this event.
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : event ? (
          <div className="flex-1 overflow-y-auto pb-6">
            <EventBanner media={event.media} title={event.title} />

            <div className="p-6 space-y-8">
              <EventStats
                dateAndTime={event.dateAndTime}
                capacity={event.capacity}
              />
              <EventTickets tickets={event.tickets} />
              <EventAbout
                description={event.description}
                termsAndConditions={event.termsAndConditions}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Event not found.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
