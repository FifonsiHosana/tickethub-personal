import { createContext } from "react";
import type { DatePreset, DateRange } from "@/utils/dateRanges";

export type DateFilterState = {
  preset: DatePreset;
  customRange: DateRange;
};

export type DashboardDateRangeValue = DateFilterState & {
  range: DateRange | null;
  setPreset: (preset: DatePreset) => void;
  applyCustomRange: (range: DateRange) => void;
};

export const EMPTY_RANGE: DateRange = { from: "", to: "" };

export const DashboardDateRangeContext =
  createContext<DashboardDateRangeValue | null>(null);