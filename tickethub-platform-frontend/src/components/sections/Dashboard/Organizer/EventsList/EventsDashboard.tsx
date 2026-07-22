import { useState } from "react";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerDashboardData } from "@/hooks/organizers/useDashboardData";

import { DashboardStatistics } from "./DashboardStatistics";
import { EventsTable } from "./EventsTable";

export default function EventsDashboard() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const {
    data: response,
    isLoading: isEventsLoading,
    isError: isEventsError,
  } = useOrganizerEvents({ page, pageSize: 10, search: search || undefined });

  const events = response?.data;
  const pagination = response?.pagination;

  const { data: dashboardData } = useOrganizerDashboardData();

  return (
    <div className="flex-1 space-y-6 p-2 md:p-3 pt-6 bg-neutral-50/30 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between ">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#1a201c]">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1 font-sans">
            Manage your created events, track statuses, and view revenue
            details.
          </p>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <DashboardStatistics statistics={dashboardData?.statistics} />

      {/* EVENTS TABLE */}
      <EventsTable
        events={events}
        isLoading={isEventsLoading}
        isError={isEventsError}
        search={search}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        page={page}
        onPageChange={setPage}
        pagination={pagination}
      />
    </div>
  );
}
