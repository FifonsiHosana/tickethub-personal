import { format } from "date-fns";
import type { Event } from "@/types/event.types";

export function venueQuery(event: Event): string {
  return [event.venueName, event.address, event.city, event.country]
    .filter(Boolean)
    .join(", ");
}

export function directionsUrl(event: Event): string {
  const link = event.googleMapLink?.trim();
  if (link) return link;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venueQuery(event),
  )}`;
}

export function mapEmbedUrl(event: Event): string | null {
  const link = event.googleMapLink?.trim();
  if (link && /google\.[^/]+\/maps|maps\.google\./i.test(link)) {
    if (/[?&]output=embed/i.test(link)) return link;
    return `${link}${link.includes("?") ? "&" : "?"}output=embed`;
  }
  const query = link || venueQuery(event);
  if (!query) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

export function getBannerUrl(event: Event): string | undefined {
  return event.images?.find((image) => image.type === "Banner")?.imageUrl;
}

export function formatEventDates(event: Event) {
  const start = new Date(event.dateAndTime);
  const end = event.dateAndTimeEnd ? new Date(event.dateAndTimeEnd) : null;

  return {
    dateStr: format(start, "EEE, MMM dd"),
    timeStr: format(start, "h:mm a"),
    endStr: end
      ? `${format(end, "EEE, MMM dd")} • ${format(end, "h:mm a")}`
      : "—",
    timeEndStr: end ? format(end, "h:mm a") : "",
  };
}

export function organizerDisplayName(event: Event): string {
  return (
    event.organizerLastName?.trim() ||
    event.organizerFirstName?.trim() ||
    "Organizer"
  );
}