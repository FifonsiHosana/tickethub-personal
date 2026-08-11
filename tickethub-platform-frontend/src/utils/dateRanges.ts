import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";

export type DatePreset =
  | "all"
  | "today"
  | "week"
  | "month"
  | "lastMonth"
  | "year"
  | "lastYear"
  | "custom";

export type DateRange = { from: string; to: string };

export const DATE_FILTER_OPTIONS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "lastMonth", label: "Last Month" },
  { value: "year", label: "This Year" },
  { value: "lastYear", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

const fmt = (date: Date) => format(date, "yyyy-MM-dd");

export function presetToRange(
  preset: Exclude<DatePreset, "custom">,
): DateRange | null {
  const now = new Date();

  switch (preset) {
    case "all":
      return null;
    case "today":
      return { from: fmt(now), to: fmt(now) };
    case "week":
      return {
        from: fmt(startOfWeek(now, { weekStartsOn: 0 })),
        to: fmt(endOfWeek(now, { weekStartsOn: 0 })),
      };
    case "month":
      return { from: fmt(startOfMonth(now)), to: fmt(endOfMonth(now)) };
    case "lastMonth": {
      const lastMonth = subMonths(now, 1);
      return {
        from: fmt(startOfMonth(lastMonth)),
        to: fmt(endOfMonth(lastMonth)),
      };
    }
    case "year":
      return { from: fmt(startOfYear(now)), to: fmt(endOfYear(now)) };
    case "lastYear": {
      const lastYear = subYears(now, 1);
      return {
        from: fmt(startOfYear(lastYear)),
        to: fmt(endOfYear(lastYear)),
      };
    }
  }
}

export function labelForPreset(preset: DatePreset): string {
  if (preset === "custom") {
    return "Custom Range";
  }
  return (
    DATE_FILTER_OPTIONS.find((option) => option.value === preset)?.label ??
    "All Time"
  );
}

/**
 * Resolves a range for endpoints that always require from/to —
 * falls back to a wide window (All Time) when no range is active.
 */
export function chartRange(range: DateRange | null): DateRange {
  if (!range) {
    return { from: "2000-01-01", to: fmt(new Date()) };
  }
  return {
    from: range.from || "2000-01-01",
    to: range.to || fmt(new Date()),
  };
}
