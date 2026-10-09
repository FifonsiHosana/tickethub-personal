const FORM_DATE_LENGTH = 16;

export function toEventFormDate(value?: string | null) {
  if (!value) return "";
  return value.trim().replace(" ", "T").replace(/Z$/, "").slice(0, FORM_DATE_LENGTH);
}

export function toEventApiDate(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const local = trimmed.replace("T", " ").slice(0, FORM_DATE_LENGTH);
  return `${local}:00`;
}