import React from "react";
import { motion } from "framer-motion";
import { FrownIcon } from "lucide-react";
import { EventCard } from "./EventCard";
import { type Event } from "@/types/event.types";

interface EventsGridProps {
  events: Event[];
}

export const EventsGrid: React.FC<EventsGridProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center bg-white rounded-4xl border border-neutral-100 border-dashed">
        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
          <FrownIcon className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          No events found
        </h3>
        <p className="text-neutral-500 font-sans max-w-sm">
          We couldn't find any events matching your current filters. Try
          adjusting your search.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
    >
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </motion.div>
  );
};
