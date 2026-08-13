import { useState, type ReactNode } from "react";
import { AnalyticsOverviewFiltersContext } from "./AnalyticsOverviewFiltersContext";

export function AnalyticsOverviewFiltersProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [eventId, setEventId] = useState("");
  const [ticketId, setTicketId] = useState("");

  const handleSetEventId = (next: string) => {
    setEventId(next);
    setTicketId("");
  };

  return (
    <AnalyticsOverviewFiltersContext.Provider
      value={{ eventId, ticketId, setEventId: handleSetEventId, setTicketId }}
    >
      {children}
    </AnalyticsOverviewFiltersContext.Provider>
  );
}
