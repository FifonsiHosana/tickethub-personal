import { EventsSkeleton } from "@/components/shared/EventsSkeleton";
import { PaginationSect } from "@/components/shared/Pagination";
import { useEvents } from "@/hooks/attendees/events/useEvent";
import type { Event } from "@/types/event.types";
import { format } from "date-fns";
import React, { useState } from "react";
import { Link } from "react-router";

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

  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Failed to load events.</div>
    );

  if (isLoading) {
    return <EventsSkeleton pageSize={PAGE_SIZE} />;
  }

  if (events.length === 0)
    return (
      <div className="p-8 text-center text-neutral-500">No events found.</div>
    );

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
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
                <div className="absolute top-4 left-4 flex gap-3">
                  <div className=" bg-white/90 backdrop-blur-sm text-foreground text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                    {formattedDate}
                  </div>
                </div>
              </div>
              {/* Text Content */}
              <div className="flex flex-col gap-1.5 items-start">
                <h3 className="text-xl font-semibold text-foreground line-clamp-1 group-hover:text-neutral-600 transition-colors">
                  {event.title}
                </h3>

                {/* Subtitle / Details Line */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-600">
                  {event.venueName && (
                    <>
                      <span className="font-medium text-neutral-800 line-clamp-1">
                        {event.venueName}, {event.city}
                      </span>
                      <span>•</span>
                    </>
                  )}
                  <span>
                    {formattedDateTime} at {formattedTime}
                  </span>
                </div>

                {/* USSD Code Tag */}
                <span className="mt-1 inline-block rounded bg-primary/80 text-white px-2 py-0.5 text-xs font-mono font-bold tracking-wider">
                  {`*920*658*${event.id}#`}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="mt-10">
        <PaginationSect
          currentPage={currentPage}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  );
};
