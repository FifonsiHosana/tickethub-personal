import { useEffect, useMemo, useState, type ReactNode } from "react";
import { presetToRange } from "@/utils/dateRanges";
import type { DatePreset, DateRange } from "@/utils/dateRanges";
import {
  DashboardDateRangeContext,
  EMPTY_RANGE,
  type DateFilterState,
  type DashboardDateRangeValue,
} from "./DashboardDateRangeContext";

const STORAGE_KEY = "tickethub-date-filter";

function readStoredState(): DateFilterState {
  const fallback: DateFilterState = { preset: "all", customRange: EMPTY_RANGE };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<DateFilterState>;
    return {
      preset: parsed.preset ?? "all",
      customRange: parsed.customRange ?? EMPTY_RANGE,
    };
  } catch {
    return fallback;
  }
}

export function DashboardDateRangeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<DateFilterState>(readStoredState);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<DashboardDateRangeValue>(() => {
    const range =
      state.preset === "custom"
        ? state.customRange.from && state.customRange.to
          ? state.customRange
          : null
        : presetToRange(state.preset as Exclude<DatePreset, "custom">);

    return {
      ...state,
      range,
      setPreset: (preset) => setState((prev) => ({ ...prev, preset })),
      applyCustomRange: (customRange: DateRange) =>
        setState((prev) => ({ ...prev, preset: "custom", customRange })),
    };
  }, [state]);

  return (
    <DashboardDateRangeContext.Provider value={value}>
      {children}
    </DashboardDateRangeContext.Provider>
  );
}