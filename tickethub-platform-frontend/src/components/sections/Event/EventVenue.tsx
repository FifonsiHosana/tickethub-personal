import React from "react";
import type { Event } from "@/types/event.types";
import { mapEmbedUrl } from "./eventUtils";

export const EventVenue: React.FC<{ event: Event }> = ({ event }) => {
  // const addressLine = [event.address, event.city, event.country]
  //   .filter(Boolean)
  //   .join(", ");
  const mapSrc = mapEmbedUrl(event);

  return (
    <>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">Venue</h3>

        <div className="space-y-1">
          {event.venueName && (
            <p className="text-sm text-muted-foreground">{event.venueName}</p>
          )}
          {/* {addressLine && (
            <p className="text-sm text-muted-foreground">{addressLine}</p>
          )} */}
        </div>

        {mapSrc && (
          <div className="overflow-hidden rounded-xl border border-border">
            <iframe
              title={`Map of ${event.venueName}`}
              src={mapSrc}
              className="h-64 w-full border-0"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </>
  );
};
