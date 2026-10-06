import { useContext } from "react";
import { DashboardEventFilterContext } from "./DashboardEventFilterContext";
import type { DashboardEventFilterValue } from "./DashboardEventFilterContext";

export function useDashboardEventFilter(): DashboardEventFilterValue {
  const context = useContext(DashboardEventFilterContext);
  if (!context) {
    throw new Error(
      "useDashboardEventFilter must be used within DashboardEventFilterProvider",
    );
  }
  return context;
}
