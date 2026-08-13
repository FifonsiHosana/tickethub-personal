import { useContext } from "react";
import { AnalyticsOverviewFiltersContext } from "./AnalyticsOverviewFiltersContext";

export function useAnalyticsOverviewFilters() {
  const context = useContext(AnalyticsOverviewFiltersContext);
  if (!context) {
    throw new Error(
      "useAnalyticsOverviewFilters must be used within AnalyticsOverviewFiltersProvider",
    );
  }
  return context;
}