import { createContext } from "react";

export interface AnalyticsFiltersState {
  eventId: string;
  ticketId: string;
  setEventId: (eventId: string) => void;
  setTicketId: (ticketId: string) => void;
}

export const AnalyticsOverviewFiltersContext =
  createContext<AnalyticsFiltersState | null>(null);
