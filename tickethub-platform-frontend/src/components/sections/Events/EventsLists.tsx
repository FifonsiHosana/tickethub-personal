import React, { useState, useMemo } from "react";
import { useEvents } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { EventsFilterBar } from "./EventsFilterBar";
import { EventsGrid } from "./EventsGrid";

export const EventsLists: React.FC = () => {
  const { data: events, isLoading, isError } = useEvents();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Client-side filtering logic
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venueName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = activeFilter === "All" || true; // Replace `true` with `event.category === activeFilter` later

      return matchesSearch && matchesCategory;
    });
  }, [events, searchQuery, activeFilter]);

  if (isLoading) return <Loader loading={isLoading} fullScreen={true} />;

  if (isError) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <p className="text-red-500 font-medium">
          Failed to load events. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-neutral-50/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col items-start gap-4 mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-tight">
            Upcoming{" "}
            <span className="italic text-neutral-400">experiences</span>
          </h1>
        </div>

        {/* Filters */}
        <EventsFilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
        />

        {/* Results Grid */}
        <EventsGrid events={filteredEvents} />
      </div>
    </main>
  );
};
