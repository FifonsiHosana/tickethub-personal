import { useContext } from "react";
import { DashboardDateRangeContext } from "./DashboardDateRangeContext";
import type { DashboardDateRangeValue } from "./DashboardDateRangeContext";

export function useDashboardDateRange(): DashboardDateRangeValue {
  const context = useContext(DashboardDateRangeContext);
  if (!context) {
    throw new Error(
      "useDashboardDateRange must be used within DashboardDateRangeProvider",
    );
  }
  return context;
}