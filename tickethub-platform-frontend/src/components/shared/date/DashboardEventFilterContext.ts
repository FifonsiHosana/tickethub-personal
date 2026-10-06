import { createContext } from "react";

export type DashboardEventFilterValue = {
  eventId: string;
  eventIdNumber: number | undefined;
  setEventId: (eventId: string) => void;
};

export const DashboardEventFilterContext =
  createContext<DashboardEventFilterValue | null>(null);

