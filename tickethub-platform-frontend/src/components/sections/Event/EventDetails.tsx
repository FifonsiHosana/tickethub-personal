import React, { useState, useEffect } from "react";
import { useEvent } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { format } from "date-fns";
import { CalendarDays, MapPin, User } from "lucide-react";
import { EventTicketingSidebar } from "./EventTicketingSidebar";
import { FastAverageColor } from "fast-average-color";

export const EventDetails: React.FC = () => {
  const { data: event, isLoading, isError } = useEvent();
  const [bgColor, setBgColor] = useState("#f5f5f5");

  useEffect(() => {
    
    if (!event?.images) return;
    const banner = event.images.find((img) => img.type === "Banner")?.imageUrl;

    if (banner) {
      const fac = new FastAverageColor();
      fac
        .getColorAsync(banner, { algorithm: "dominant" })
        .then((color) => {
          setBgColor(color.hex);
        })
        .catch((e) => {
          console.error("Error getting color:", e);
        });
    }
  }, [event]);

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
    (image) => image.type === "Banner"
  )?.imageUrl;

  const formattedDateStr = format(new Date(event.dateAndTime), "EEE, MMM dd");
  const formattedTimeStr = format(new Date(event.dateAndTime), "h:mm a");

  // Format for the image overlay badge
  const overlayTime = format(new Date(event.dateAndTime), "MMM dd, h:mm a");

  return (
    <main className="w-full min-h-screen bg-neutral-50/50 pb-24 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Event Image */}
        <div className="lg:col-span-5">
          <div
            className="sticky top-24 w-full aspect-4/5 md:h-full rounded-4xl overflow-hidden shadow-xl shadow-neutral-200/40 transition-colors duration-500 ease-in-out"
            style={{ backgroundColor: bgColor }}
          >
            {bannerImage ? (
              <img
                src={bannerImage}
                alt={event.title}
                crossOrigin="anonymous"
                className="w-full h-full object-contain relative z-10 p-4 rounded-lg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 bg-neutral-100">
                No Banner Available
              </div>
            )}

            {/* Time Badge Overlay */}
            <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              {overlayTime}
            </div>
          </div>
        </div>

        {/* Right Column: Details & Ticketing */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Event Header & Summary Card */}
          <div className="bg-white rounded-4xl p-5 sm:p-6 border border-neutral-300 shadow-sm flex flex-col gap-3">
            {/* Title Section */}
            <div>
              <h1 className="text-3xl font-bold text-foreground uppercase tracking-tight leading-none">
                {event.title}
              </h1>
            </div>

            {/* When, Where, By Summary Box 2 */}
            <div className="flex flex-col gap-1 text-sm mb-2">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-primary" />
                <p className="text-neutral-700">
                  {formattedDateStr} &bull; {formattedTimeStr}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-neutral-700">
                  {event.venueName || `${event.city}, ${event.country}`}
                </p>
              </div>

              <div className="flex items-center gap-1">
                <User className="w-4 h-4 text-primary" />
                <p className="text-neutral-700">
                  {`${event.organizerFirstName} ${event.organizerLastName}`}
                </p>
              </div>
            </div>

            {/* Ticketing Component (Drop-in) */}
            <div className="mt-1">
              <EventTicketingSidebar
                status={"Published"}
                eventName={event.title}
                banner={bannerImage as string}
              />
            </div>
          </div>

          {/* About Section Card */}
          <div className="bg-white rounded-4xl p-6 sm:p-8 border border-neutral-300 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">
              About this event
            </h3>
            <div className=" font-sans text-neutral-800 leading-relaxed text-sm">
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
