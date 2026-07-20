import React from "react";
import { Link } from "react-router";
import { useEvents } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import type { Event } from "@/types/event.types";

export const EventsList: React.FC = () => {
  const { data: events, isLoading, isError } = useEvents();

  if (isLoading) return <Loader loading={isLoading} />;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Failed to load events.</div>
    );
  if (!events || events.length === 0)
    return (
      <div className="p-8 text-center text-neutral-500">No events found.</div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl md:text-4xl text-[#1a201c] tracking-tight">
          Upcoming Events
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event: Event) => {
          const bannerImage = event.banner;

          return (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group flex flex-col gap-4 focus:outline-none"
            >
              {/* Image Container */}
              <div className="w-full aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 relative">
                <img
                  src={bannerImage}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#1a201c] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  {new Date(event.dateAndTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-start">
                <h3 className="text-xl font-sans font-semibold text-[#1a201c] line-clamp-1 mb-1 group-hover:text-neutral-600 transition-colors">
                  {event.title}
                </h3>
                {event.venueName && (
                  <p className="text-sm text-neutral-500 line-clamp-1">
                    {event.venueName}, {event.city}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
