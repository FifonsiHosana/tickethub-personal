import React, { useState } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { useEvents } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";

import type { Event } from "@/types/event.types";
import { PaginationSect } from "@/components/shared/Pagination";

const PAGE_SIZE = 6;

export const EventsList: React.FC = () => {
  const [page, setPage] = useState(1);

  const {
    data: eventsResponse,
    isLoading,
    isError,
  } = useEvents({
    page,
    pageSize: PAGE_SIZE,
  });

  const events = eventsResponse?.data ?? [];
  const pagination = eventsResponse?.pagination;

  if (isLoading) return <Loader loading={isLoading} fullScreen={false} />;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Failed to load events.</div>
    );
  if (!events || events.length === 0)
    return (
      <div className="p-8 text-center text-neutral-500">No events found.</div>
    );

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 md:py-24">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl md:text-4xl text-foreground tracking-tight">
          Upcoming Events
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event: Event) => {
          const bannerImage = event.banner;
          const formattedDate = format(new Date(event.dateAndTime), "MMM dd");
          const formattedDateTime = format(
            new Date(event.dateAndTime),
            "MMMM dd, yyyy",
          );
          const formattedTime = format(new Date(event.dateAndTime), "h:mm a");

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
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  {formattedDate}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex flex-col items-start">
                <h3 className="text-xl font-sans font-semibold text-foreground line-clamp-1 mb-1 group-hover:text-neutral-600 transition-colors">
                  {event.title}
                </h3>
                {event.venueName && (
                  <p className="text-sm text-neutral-700 line-clamp-1">
                    {event.venueName}, {event.city}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-1">
                  {formattedDateTime} at {formattedTime}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <PaginationSect
        currentPage={currentPage}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
      />
    </div>
  );
};
