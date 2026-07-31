import { useState } from "react";
import { useOrganizerEvents } from "@/hooks/organizers/useOrganizerEvents";
import { useOrganizerDashboardData } from "@/hooks/organizers/useDashboardData";

import { DashboardStatistics } from "./DashboardStatistics";
import { EventsTable } from "./EventsTable/index";

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
    <div className="flex-1 space-y-3 p-1 bg-neutral-50/30 min-h-screen">
      <DashboardStatistics statistics={dashboardData?.statistics} />

      <EventsTable
        events={events}
        isLoading={isEventsLoading}
        isError={isEventsError}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        page={page}
        onPageChange={setPage}
        pagination={pagination}
      />
    </div>
  );
}
