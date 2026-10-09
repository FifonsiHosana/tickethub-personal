import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DashboardEventFilterContext } from "./DashboardEventFilterContext";
import type { DashboardEventFilterValue } from "./DashboardEventFilterContext";

const STORAGE_KEY = "tickethub-event-filter";

function readStoredEventId() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function DashboardEventFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [eventId, setEventId] = useState(readStoredEventId);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, eventId);
  }, [eventId]);

  const value = useMemo<DashboardEventFilterValue>(() => {
    const parsed = Number(eventId);
    return {
      eventId,
      eventIdNumber: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
      setEventId,
    };
  }, [eventId]);

  return (
    <DashboardEventFilterContext.Provider value={value}>
      {children}
    </DashboardEventFilterContext.Provider>
  );
}
