import React from "react";
import { useEvent, useEvents } from "@/hooks/attendees/events/useEvent";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "@/components/ui/loader";
import { EventTicketingSidebar } from "./EventTicketingSidebar";
import { EventsLists } from "../Events/EventsLists";
import { RichText } from "./RichText";
import { EventHero } from "./EventHero";
import { EventDateTime } from "./EventDateTime";
import { EventVenue } from "./EventVenue";
import { EventNotFound } from "./EventNotFound";
import { MobileTicketBar } from "./MobileTicketBar";
import { useBannerColor } from "./useBannerColor";
import { useTicketsVisibility } from "./useTicketsVisibility";
import { getBannerUrl } from "./eventUtils";

export const EventDetails: React.FC = () => {
  const { data: event, isLoading, isError, error } = useEvent();
  const { isMobile } = useIsMobile();
  const { data: eventsResponse } = useEvents({
    page: 1,
    pageSize: 1,
    search: undefined,
    categoryId: event?.categoryIds[0] || undefined,
  });

  const bgColor = useBannerColor(event);
  const { ticketsSectionRef, isTicketsVisible, scrollToTickets } =
    useTicketsVisibility(isMobile);

  if (isLoading) return <Loader loading={isLoading} fullScreen={true} />;

  if (error?.message === "Event not found") return <EventNotFound />;

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen p-8 text-center text-red-500">
        Failed to load event details.
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center text-neutral-500">Event not found.</div>
    );
  }

  const bannerImage = getBannerUrl(event);

  return (
    <div>
      <EventHero
        event={event}
        bannerImage={bannerImage}
        bgColor={bgColor}
        isMobile={isMobile}
        onGetTickets={scrollToTickets}
      />

      {/* Main content */}
      <div className="mx-auto px-5 pb-16 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            <div className="w-full lg:w-[60%] space-y-6">
              {/* About Section */}
              <div className="space-y-3 mt-5">
                <h2 className="text-2xl font-semibold">About This Event</h2>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <RichText html={event.description as string} />
                </div>
              </div>

              {/* Date & Time */}
              <EventDateTime event={event} />

              {/* Venue */}
              <EventVenue event={event} />
            </div>

            {/* Tickets */}
            <div
              ref={ticketsSectionRef}
              id="tickets-section"
              className="w-full lg:w-[40%]"
            >
              <EventTicketingSidebar
                status="Published"
                eventName={event.title}
                banner={bannerImage as string}
              />
            </div>
          </div>
        </div>

        {/* Similar events */}
        {(eventsResponse?.data.length as number) > 1 && (
          <div className="mx-auto py-16">
            <div className="text-2xl font-bold text-stone-900 mb-8">
              Similar Events
            </div>

            <EventsLists eventId={event.id} category={event.categoryIds} />
          </div>
        )}

        <MobileTicketBar
          title={event.title}
          hidden={isTicketsVisible}
          onGetTickets={scrollToTickets}
        />
      </div>
    </div>
  );
};
