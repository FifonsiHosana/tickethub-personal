import React, { useState } from "react";
import { useEvents, useCategories } from "@/hooks/attendees/events/useEvent";
import { Loader } from "@/components/ui/loader";
import { EventsFilterBar } from "./EventsFilterBar";
import { EventsGrid } from "./EventsGrid";
import { PaginationSect } from "@/components/shared/Pagination";

const PAGE_SIZE = 6;

export const EventsLists: React.FC = () => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const {
    data: eventsResponse,
    isLoading,
    isError,
  } = useEvents({
    page,
    pageSize: PAGE_SIZE,
    search: searchQuery || undefined,
    categoryId: activeCategoryId ?? undefined,
  });

  const { data: categories } = useCategories();

  const events = eventsResponse?.data ?? [];
  const pagination = eventsResponse?.pagination;
  const allCategories = categories ?? [];

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCategoryChange = (id: number | null) => {
    setActiveCategoryId(id);
    setPage(1);
  };

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

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);

  return (
    <main className="w-full min-h-screen bg-neutral-50/30 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col items-start gap-4 mb-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-tight">
            <span>Upcoming </span>
            <span className="italic text-neutral-400">experiences</span>
          </h1>
        </div>

        {/* Filters */}
        <EventsFilterBar
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          activeCategoryId={activeCategoryId}
          setActiveCategoryId={handleCategoryChange}
          categories={allCategories}
        />

        {/* Results Grid */}
        <EventsGrid events={events} />

        {/* Pagination */}
        <PaginationSect
          currentPage={currentPage}
          totalPages={totalPages}
          page={page}
          setPage={setPage}
        />
      </div>
    </main>
  );
};
