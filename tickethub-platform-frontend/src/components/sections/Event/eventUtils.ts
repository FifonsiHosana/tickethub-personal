import { format } from "date-fns";
import type { Event } from "@/types/event.types";
import { normalizeGoogleMapLink } from "@/utils/googleMapLink";

export function venueQuery(event: Event): string {
  return [event.venueName, event.address, event.city, event.country]
    .filter(Boolean)
    .join(", ");
}

function isEmbeddableGoogleMapsUrl(link: string) {
  try {
    const url = new URL(link);
    const host = url.hostname.toLowerCase();
    return (
      ((host === "google.com" || host === "www.google.com") &&
        url.pathname.startsWith("/maps")) ||
      host === "maps.google.com"
    );
  } catch {
    return false;
  }
}

export function directionsUrl(event: Event): string {
  const link = normalizeGoogleMapLink(event.googleMapLink);
  if (link) return link;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    venueQuery(event),
  )}`;
}

export function mapEmbedUrl(event: Event): string | null {
  const link = normalizeGoogleMapLink(event.googleMapLink);
  if (link && isEmbeddableGoogleMapsUrl(link)) {
    if (/[?&]output=embed/i.test(link)) return link;
    return `${link}${link.includes("?") ? "&" : "?"}output=embed`;
  }

  const query = venueQuery(event);
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
