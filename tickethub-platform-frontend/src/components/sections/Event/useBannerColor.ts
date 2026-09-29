import { useEffect, useState } from "react";
import { FastAverageColor } from "fast-average-color";
import type { Event } from "@/types/event.types";
import { getBannerUrl } from "./eventUtils";

/** Dominant color of the event banner. */
export function useBannerColor(event: Event | undefined, fallback = "#f5f5f5") {
  const [bgColor, setBgColor] = useState(fallback);

  useEffect(() => {
    if (!event?.images) return;

    const banner = getBannerUrl(event);
    if (!banner) return;

    new FastAverageColor()
      .getColorAsync(banner, { algorithm: "dominant" })
      .then((color) => setBgColor(color.hex))
      .catch((e) => console.error("Error getting color:", e));
  }, [event]);

  return bgColor;
}
