import React from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { type Event } from "@/types/event.types";

interface EventCardProps {
  event: Event;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const bannerImage = event.banner;

  const formattedDate = new Date(event.dateAndTime).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );

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
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-[#1a201c] text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider shadow-sm">
            {formattedDate}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-start grow px-1">
          <h3 className="text-xl font-sans font-bold text-foreground line-clamp-1 mb-1 group-hover:text-neutral-500 transition-colors">
            {event.title}
          </h3>
          <p className="text-sm text-neutral-500 font-medium line-clamp-1 uppercase tracking-widest mt-1">
            {event.venueName
              ? `${event.venueName}, ${event.city}`
              : "Location TBA"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};
