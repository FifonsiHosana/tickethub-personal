import React from "react";
import { Card } from "@/components/ui/card";
import type { Event } from "@/types/event.types";
import { formatEventDates } from "./eventUtils";

export const EventDateTime: React.FC<{ event: Event }> = ({ event }) => {
  const { dateStr, timeStr, endStr, timeEndStr } = formatEventDates(event);

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Date & Time</h3>

        <Card className="p-0 overflow-hidden border border-border">
          <div className="grid grid-cols-2 divide-x divide-border">
            <div className="p-4">
              <p className="text-xs font-semibold text-foreground">Begins</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {dateStr} &bull; {timeStr}
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs font-semibold text-foreground">Ends</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">
                {endStr} 
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};
