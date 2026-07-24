import { logger } from "./logger";

export function extractTicketIdentifier(decodedText: string): string {
  try {
    const url = new URL(decodedText);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "t") {
      return parts[1];
    }
  } catch (err) {
    logger.error(`Error decoding url ${err}`);
  }
  return decodedText;
}
