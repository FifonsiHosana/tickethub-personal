import { gte, lte } from 'drizzle-orm';

export interface DateRange {
  from?: string | undefined;
  to?: string | undefined;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalizes a "to" bound so date-only values (yyyy-MM-dd) include the
 * whole day instead of stopping at midnight.
 */
export function toUpperBound(value: string): string {
  return DATE_ONLY_PATTERN.test(value) ? `${value}T23:59:59.999` : value;
}

/**
 * Appends gte/lte conditions for the given column onto a filter array.
 * Each side is optional, so partial ranges work too.
 */
export function applyDateRange(
  filters: any[],
  column: any,
  range?: DateRange,
) {
  if (range?.from) {
    filters.push(gte(column, range.from));
  }
  if (range?.to) {
    filters.push(lte(column, toUpperBound(range.to)));
  }
}