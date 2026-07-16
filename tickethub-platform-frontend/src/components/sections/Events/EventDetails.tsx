import React from "react";
import { useEvent } from "@/hooks/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { EventTicketingSidebar } from "./EventTicketingSidebar";

export const EventDetails: React.FC = () => {
  const { data: event, isLoading, isError } = useEvent();

  if (isLoading) return <Loader loading={isLoading} fullScreen={true} />;
  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load event details.
      </div>
    );
  }
  if (!event) {
    return (
      <div className="p-8 text-center text-neutral-500">Event not found.</div>
    );
  }

  const bannerImage = event.images.find(
    (image) => image.type === "Banner",
  )?.imageUrl;

  // Format date for the main details section (e.g., Wed, Jul 15 • 3:00 PM)
  const formattedDateStr = new Date(event.dateAndTime).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    },
  );
  const formattedTimeStr = new Date(event.dateAndTime).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );

  // Format for the image overlay badge
  const overlayTime = new Date(event.dateAndTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <main className="w-full min-h-screen bg-neutral-50/50 pt-8 pb-24 md:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Event Image (Sticky) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 w-full aspect-4/5 rounded-4xl overflow-hidden shadow-xl shadow-neutral-200/40 bg-neutral-100">
            {bannerImage ? (
              <img
                src={bannerImage}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                No Banner Available
              </div>
            )}

            {/* Time Badge Overlay */}
            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              {overlayTime}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Ticketing */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Event Header & Summary Card */}
          <div className="bg-white rounded-4xl p-6 sm:p-8 border border-neutral-100 shadow-sm flex flex-col gap-8">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground uppercase tracking-tight leading-none mb-3">
                {event.title}
              </h1>
              <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest text-neutral-600 uppercase bg-neutral-100 rounded-full">
                {/* {event.status} */}
              </span>
            </div>

            {/* When, Where, By Summary Box */}
            <div className="flex flex-col border border-neutral-100 rounded-2xl overflow-hidden text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-neutral-100 gap-2">
                <span className="text-neutral-400 uppercase tracking-widest font-medium text-xs">
                  When
                </span>
                <span className="font-medium text-foreground sm:text-right">
                  {formattedDateStr} &bull; {formattedTimeStr}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border-b border-neutral-100 gap-2">
                <span className="text-neutral-400 uppercase tracking-widest font-medium text-xs">
                  Where
                </span>
                <span className="font-medium text-foreground sm:text-right">
                  {event.venueName || `${event.city}, ${event.country}`}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-2">
                <span className="text-neutral-400 uppercase tracking-widest font-medium text-xs">
                  By
                </span>
                <span className="font-medium text-foreground sm:text-right uppercase">
                  {/* Would change to organizer name later */}
                  {event.venueName}
                </span>
              </div>
            </div>

            {/* Ticketing Component (Drop-in) */}
            <div className="mt-2">
              <EventTicketingSidebar
                status={"Published"}
                capacity={event.capacity}
                eventName={event.title}
                banner={bannerImage as string}
              />
            </div>
          </div>

          {/* About Section Card */}
          <div className="bg-white rounded-4xl p-6 sm:p-8 border border-neutral-100 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">
              About this event
            </h3>
            <div className="prose prose-neutral max-w-none font-sans text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                {event.description || "No description provided for this event."}
              </p>
            </div>

            {/* Terms & Conditions */}
            {event.termsAndConditions && (
              <div className="mt-8 pt-6 border-t border-dashed border-neutral-200">
                <h4 className="text-xs font-bold text-foreground mb-2 uppercase tracking-widest">
                  Terms & Conditions
                </h4>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {event.termsAndConditions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
