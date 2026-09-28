import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Calendar,
  CalendarOff,
  MapPinned,
  Smartphone,
} from "lucide-react";
import { FastAverageColor } from "fast-average-color";
import { useEvent } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { EventTicketingSidebar } from "./EventTicketingSidebar";
import { Card } from "@/components/ui/card";
import { EventsLists } from "../Events/EventsLists";
import { useIsMobile } from "@/hooks/use-mobile";
import EventBanner from "./EventBanner";
import type { Event } from "@/types/event.types";
import { RichText } from "./RichText";

function venueQuery(event: Event): string {
  return [event.venueName, event.address, event.city, event.country]
    .filter(Boolean)
    .join(", ");
}

function directionsUrl(event: Event): string {
  const link = event.googleMapLink?.trim();
  if (link) return link;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venueQuery(event),
  )}`;
}

function mapEmbedUrl(event: Event): string | null {
  const link = event.googleMapLink?.trim();
  if (link && /google\.[^/]+\/maps|maps\.google\./i.test(link)) {
    if (/[?&]output=embed/i.test(link)) return link;
    return `${link}${link.includes("?") ? "&" : "?"}output=embed`;
  }
  const query = link || venueQuery(event);
  if (!query) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export const EventDetails: React.FC = () => {
  const { data: event, isLoading, isError, error } = useEvent();
  const { isMobile } = useIsMobile();

  const [bgColor, setBgColor] = useState("#f5f5f5");
  const [isTicketsVisible, setIsTicketsVisible] = useState(false);

  const ticketsSectionRef = useRef<HTMLDivElement | null>(null);

  /*
   * Get the dominant color from the event banner.
   */
  useEffect(() => {
    if (!event?.images) return;

    const banner = event.images.find((img) => img.type === "Banner")?.imageUrl;

    if (!banner) return;

    const fac = new FastAverageColor();

    fac
      .getColorAsync(banner, { algorithm: "dominant" })
      .then((color) => {
        setBgColor(color.hex);
      })
      .catch((e) => {
        console.error("Error getting color:", e);
      });
  }, [event]);

  /*
   * Observe the ticket section.
   *
   * The mobile sticky "Get Tickets" button is shown
   * whenever the ticket section is outside the viewport.
   */
  useEffect(() => {
    if (!isMobile) {
      setIsTicketsVisible(false);
      return;
    }

    const target = ticketsSectionRef.current;

    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsTicketsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [isMobile]);

  /*
   * Smoothly scroll to the ticket section.
   */
  const scrollToTickets = () => {
    ticketsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (isLoading) {
    return <Loader loading={isLoading} fullScreen={true} />;
  }

  if (error?.message === "Event not found") {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
          <CalendarOff className="w-30 h-30 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Event not found
        </h1>

        <p className="text-neutral-500 max-w-sm mb-6">
          This event doesn't exist or may have been removed.
        </p>

        <div className="flex gap-3 justify-center items-center">
          <Button className="p-2 mt-2 rounded-full">
            <Link to="/events" className="p-2">
              Browse events
            </Link>
          </Button>

          <Button variant="outline" className="mt-2 rounded-full">
            <Link to="/" className="p-2">
              Go home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

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

  const bannerImage = event.images.find(
    (image) => image.type === "Banner",
  )?.imageUrl;

  const formattedDateStr = format(new Date(event.dateAndTime), "EEE, MMM dd");

  const formattedTimeStr = format(new Date(event.dateAndTime), "h:mm a");

  const formattedEndStr = event.dateAndTimeEnd
    ? `${format(new Date(event.dateAndTimeEnd), "EEE, MMM dd")} • ${format(
        new Date(event.dateAndTimeEnd),
        "h:mm a",
      )}`
    : "—";

  // const overlayTime = format(new Date(event.dateAndTime), "MMM dd, h:mm a");

  const addressLine = [event.address, event.city, event.country]
    .filter(Boolean)
    .join(", ");

  const mapSrc = mapEmbedUrl(event);

  return (
    <div>
      {/* Hero */}
      <div className="relative min-h-120 lg:min-h-150 flex flex-col w-full justify-center py-6">
        <div className="max-w-7xl mx-auto">
          <div className="absolute inset-0 -z-1 pointer-events-none bottom-0 left-0 right-0 bg-radial-[115%_140%_at_85%_65%] from-[rgba(255,216,190,0.3)] from-40% to-[rgba(248,250,252,1)] to-100%"></div>
          <div className="absolute inset-0 -z-1 pointer-events-none  bottom-0 left-0 right-0 bg-[linear-gradient(to_right,#e8bebe2e_1px,transparent_1px),linear-gradient(to_bottom,#e8bebe2e_1px,transparent_1px)] bg-[size:37px_36px]"></div>
          <div className="px-6 ">
            <div className="pt-30 lg:pt-16 ">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">
                {/* Event information */}
                <div className="flex-1 w-full space-y-6 order-2 lg:order-1 text-center sm:text-left">
                  {/* Mobile image */}

                  {/* Mobile image */}
                  <div className="lg:hidden mb-6">
                    <div className="relative w-full max-w-70 mx-auto aspect-square">
                      <div className="absolute inset-0 bg-white rounded-2xl shadow-lg" />

                      <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-stone-900/5">
                        <img
                          src={bannerImage as string}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="inline-flex items-center px-3 py-1.5 bg-white text-stone-700 text-xs font-semibold rounded-full shadow-sm ring-1 ring-stone-900/5">
                      {event.categoryNames}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-3 text-balance text-pretty">
                      {event.title.toUpperCase()}
                    </h1>

                    {/* <p className="text-base text-stone-700">
                      by{" "}
                      <span className="font-semibold text-gray-900">
                        {event.organizerFirstName}
                      </span>
                    </p> */}
                  </div>

                  {/* Event details */}
                  <div className="flex flex-wrap gap-x-6 gap-y-3 text-stone-700 justify-center sm:justify-start">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-gray-400 font-extralight" />

                      <span className="text-sm font-medium">
                        <p className="text-neutral-700">
                          {formattedDateStr} &bull; {formattedTimeStr}
                        </p>
                      </span>
                    </div>

                    <a
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-2 hover:text-[var(--color-ego-orange)] transition-colors group"
                      href={directionsUrl(event)}
                    >
                      <MapPinned className="h-5 w-5 text-gray-400" />

                      <span className="text-sm font-medium">
                        {event.venueName}, {event.city}
                      </span>
                    </a>

                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-gray-400" />

                      <span className="text-sm font-mono font-semibold">
                        *902*30*{event.id}#
                      </span>
                    </div>
                  </div>

                  {/* Desktop CTA */}
                  {!isMobile && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={scrollToTickets}
                        className="flex items-center justify-center gap-3 px-16 py-3 bg-primary/80 text-white rounded-full text-base font-medium hover:scale-105 hover:bg-primary/60 hover:cursor-pointer w-full md:w-auto transition-all"
                      >
                        Get Tickets <ArrowRight />
                      </button>
                    </div>
                  )}
                </div>

                {/* Desktop banner */}
                <EventBanner
                  bannerImage={bannerImage as string}
                  bgColor={bgColor}
                  event={event}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto px-5 pb-16 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Event information */}
            <div className="w-full lg:w-[60%] space-y-12">
              <div className="text-3xl font-semibold mb-3">
                About this event
              </div>

              <p>
                <RichText html={event.description as string} />
              </p>

              <div className="text-lg font-semibold mb-3">Date & Time</div>

              <Card className="py-0">
                <div className="grid grid-cols-2 rounded-xl overflow-hidden">
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold">Begins</p>

                    <p className="text-xs text-gray-400 mt-1 leading-snug">
                      {formattedDateStr} &bull; {formattedTimeStr}
                    </p>
                  </div>

                  <div className="px-4 py-3 border-l border-gray-400">
                    <p className="text-xs font-bold">Ends</p>

                    <p className="text-xs text-gray-400 mt-1 leading-snug">
                      {formattedEndStr}
                    </p>
                  </div>
                </div>
              </Card>

              <div className="text-lg font-semibold mb-3">Venue</div>
              <div className="py-2 flex flex-col gap-2">
                <span className="font-medium">{event.venueName}</span>
                {addressLine && (
                  <span className="text-sm text-muted-foreground">
                    {addressLine}
                  </span>
                )}
                {mapSrc && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-border">
                    <iframe
                      title={`Map of ${event.venueName}`}
                      src={mapSrc}
                      className="h-64 w-full"
                      loading="lazy"
                    />
                  </div>
                )}
                <a
                  target="_blank"
                  rel="noopener"
                  href={directionsUrl(event)}
                  className="text-sm font-medium text-primary hover:underline w-fit"
                >
                  Get Directions
                </a>
              </div>
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
        <div className="mx-auto py-16">
          <div className="text-2xl font-bold text-stone-900 mb-8">
            Similar Events
          </div>

          <EventsLists eventId={event.id} category={event.categoryIds} />
        </div>

        {/* Mobile sticky ticket bar */}
        <div
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-2xl transition-transform duration-300 ease-in-out ${
            isTicketsVisible ? "translate-y-full" : "translate-y-0"
          }`}
        >
          <div className="px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-500 mb-0.5">From ₵46.00</p>

                <p className="font-semibold text-stone-900 text-sm truncate">
                  {event.title}
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToTickets}
                className="shrink-0 bg-[#fd7d43] text-white font-semibold py-3 px-6 rounded-4xl transition-transform active:scale-95"
              >
                Get Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
