// Format a Date as UTC "YYYYMMDDTHHmmssZ", which calendars expect
const toCalDate = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

const getTimes = (event: any) => {
  const start = new Date(event.startDate); // adjust to your field names
  // fall back to 2 hours if there's no end date
  const end = event.endDate
    ? new Date(event.endDate)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start, end };
};

export const googleCalendarUrl = (event: any) => {
  const { start, end } = getTimes(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toCalDate(start)}/${toCalDate(end)}`,
    details: `Get tickets: ${window.location.href}`,
    location: `${event.venueName}, ${event.city}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const escapeIcs = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");

export const downloadIcs = (event: any) => {
  const { start, end } = getTimes(event);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TicketHub//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:event-${event.id}@tickethub`,
    `DTSTAMP:${toCalDate(new Date())}`,
    `DTSTART:${toCalDate(start)}`,
    `DTEND:${toCalDate(end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `LOCATION:${escapeIcs(`${event.venueName}, ${event.city}`)}`,
    `DESCRIPTION:${escapeIcs(`Get tickets: ${window.location.href}`)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\W+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
