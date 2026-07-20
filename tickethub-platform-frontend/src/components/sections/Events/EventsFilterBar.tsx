import React from "react";
import { SearchIcon } from "lucide-react";

interface EventsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}
// would load categories from the backend
const CATEGORIES = ["All", "Music", "Tech", "Arts", "Business", "Sports"];

export const EventsFilterBar: React.FC<EventsFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 w-full">
      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              activeFilter === category
                ? "bg-primary text-white shadow-md"
                : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:text-foreground"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative w-full md:w-80 shrink-0">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search events, venues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200 rounded-full text-sm focus:outline-none transition-all placeholder:text-neutral-400 text-foreground shadow-sm"
        />
      </div>
    </div>
  );
};
