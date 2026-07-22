import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { type Event } from "@/types/event.types";
import { format } from "date-fns";
interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const bannerImage = event.banner;

  // date formattings
  const formattedDate = format(new Date(event.dateAndTime), "MMM dd");
  const formattedDateTime = format(
    new Date(event.dateAndTime),
    "MMMM dd, yyyy",
  );
  const formattedTime = format(new Date(event.dateAndTime), "h:mm a");

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: "easeOut" },
        },
      }}
    >
      <Link
        to={`/events/${event.id}`}
        className="group flex flex-col gap-4 focus:outline-none h-full"
      >
        {/* Image Container */}
        <div className="w-full aspect-4/3 rounded-3xl overflow-hidden bg-neutral-100 relative shadow-sm border border-neutral-100">
          <img
            src={bannerImage}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          />
          {/* Date Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-foreground text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
            {formattedDate}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-start grow px-1">
          <h3 className="text-xl font-sans font-bold text-foreground line-clamp-1 mb-1 group-hover:text-neutral-500 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-neutral-800 font-medium line-clamp-1 tracking-tight mt-1">
            {event.venueName
              ? `${event.venueName}, ${event.city}`
              : "Location TBA"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {formattedDateTime} at {formattedTime}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
