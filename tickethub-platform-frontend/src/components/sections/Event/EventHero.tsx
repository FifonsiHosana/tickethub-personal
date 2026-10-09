import React, { useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  MapPinned,
  Share2,
  Smartphone,
} from "lucide-react";
import type { Event } from "@/types/event.types";
import EventBanner from "./EventBanner";
import { directionsUrl, formatEventDates, organizerDisplayName } from "./eventUtils";
import { downloadIcs } from "@/utils/calendar";

interface EventHeroProps {
  event: Event;
  bannerImage?: string;
  bgColor: string;
  isMobile: boolean;
  onGetTickets: () => void;
}

export const EventHero: React.FC<EventHeroProps> = ({
  event,
  bannerImage,
  bgColor,
  isMobile,
  onGetTickets,
}) => {
  const { dateStr, timeStr } = formatEventDates(event);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: event.title || document.title,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Suppress error if user cancelled the share dialog
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback: Copy link to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link:", err);
      }
    }
  };

  return (
    <div className="relative min-h-120 lg:min-h-150 flex flex-col w-full justify-center py-6">
      <div className="max-w-7xl mx-auto">
        <div className="absolute inset-0 -z-1 pointer-events-none bottom-0 left-0 right-0 bg-radial-[115%_140%_at_85%_65%] from-[rgba(255,216,190,0.3)] from-40% to-[rgba(248,250,252,1)] to-100%"></div>
        {/* <div className="absolute inset-0 -z-1 pointer-events-none  bottom-0 left-0 right-0 bg-[linear-gradient(to_right,#e8bebe2e_1px,transparent_1px),linear-gradient(to_bottom,#e8bebe2e_1px,transparent_1px)] bg-size-[37px_36px]"></div> */}
        <div className="absolute inset-0 -z-1 pointer-events-none  bottom-0 left-0 right-0 bg-[linear-gradient(to_right,#e4d4d42e_1px,transparent_1px),linear-gradient(to_bottom,#e4d4d42e_1px,transparent_1px)] bg-[size:46px_46px]"></div>
        <div className="px-6 ">
          <div className="pt-30 lg:pt-16 ">
            <div className="flex w-full flex-col lg:grid-cols-2 lg:grid items-start lg:items-center gap-8 lg:gap-12">
              {/* Event information */}
              <div className="flex-1 w-full min-w-0 space-y-6 order-2 lg:order-1 text-center sm:text-left">
                {/* Mobile image */}
                <div className="lg:hidden mb-6">
                  <div className="relative w-full max-w-70 mx-auto aspect-square">
                    <div className="absolute inset-0 bg-white rounded-2xl shadow-lg" />

                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white shadow-xl ring-1 ring-stone-900/5">
                      <img
                        src={bannerImage}
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
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-3 text-pretty">
                  {event.title.toUpperCase()}
                </h1>

                <p className="text-sm font-medium text-stone-600">
                  By {organizerDisplayName(event)}
                </p>

                {/* Event details */}
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-stone-700 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => downloadIcs(event)}
                    title="Add to calendar"
                    className="flex items-center gap-2 hover:text-(--color-ego-orange) transition-colors cursor-pointer"
                  >
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">
                      {dateStr} &bull; {timeStr}
                    </span>
                  </button>

                  <a
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-2 hover:text-(--color-ego-orange) transition-colors group"
                    href={directionsUrl(event)}
                  >
                    <MapPinned className="h-5 w-5 text-gray-400" />

                    <span className="text-sm font-medium">
                      {event.venueName}, {event.city}
                    </span>
                  </a>

                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-gray-400" />

                    <span className="text-sm font-mono font-semibold ">
                      <a
                        href={`
                        tel:*920*658*${event.id}#
                          `}
                        className=" hover:text-gray/70 transition-colors"
                      >
                        *920*658*{event.id}#
                      </a>
                    </span>
                  </div>
                </div>

                {/* Desktop CTA */}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 justify-center sm:justify-start">
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={onGetTickets}
                      className="flex items-center justify-center gap-3 px-16 py-3 bg-primary/80 text-white rounded-full text-base font-medium hover:scale-105 hover:bg-primary/60 cursor-pointer w-full md:w-auto transition-all"
                    >
                      Get Tickets <ArrowRight className="h-4 w-4" />
                    </button>
                  )}

                  <div className="flex justify-center sm:justify-end">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="border h-12 justify-center text-blue-500 gap-3 px-16 py-3 items-center flex rounded-full text-base font-medium hover:scale-105 transition-all cursor-pointer border-blue-300 bg-accent active:scale-95"
                    >
                      {copied ? (
                        <>
                          Copied! <Check className="h-4 w-4 text-green-600" />
                        </>
                      ) : (
                        <>
                          Share <Share2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
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
  );
};
