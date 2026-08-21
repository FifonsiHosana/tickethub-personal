import type { EventDetails, sessionContext } from "./ussd.types.js";

export const ticketType = (context: sessionContext) =>
  context.data?.ticketType.split("*")[1];

export const eventTicketId = (context: sessionContext) =>
  context.data?.ticketType.split("*")[0];

export const singleTicketPrice = (context: sessionContext) =>
  context.data?.ticketType.split("*")[2];

export const ticketsRemaining = (context: sessionContext) =>
  context.data?.ticketType.split("*")[3];

export const numberOfTickets = (context: sessionContext) =>
  context.data.numberOfTickets;

export const totalPrice = (context: sessionContext) =>
  Number(context.data?.ticketType.split("*")[2] * context.data.numberOfTickets);

export const categoryId = (context: sessionContext) =>
  context.data.category.split("*")[0];

export const categoryName = (context: sessionContext) =>
  context.data.category.split("*")[1];
export const email = "myTest@email.com";
export const eventName = (context: sessionContext) =>
  (context.eventDetails as EventDetails).name.slice(0, 40);

export const dateTimeFormat = (dateTime: string) => {
  const date = new Date(dateTime);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString(undefined, options);
};

export function stripShortcode(userdata: string, shortcode: string): string {
  let cleaned = userdata;

  // remove a leading "*" if present
  if (cleaned.startsWith("*")) {
    cleaned = cleaned.slice(1);
  }

  // remove the shortcode itself if present
  if (cleaned.startsWith(shortcode)) {
    cleaned = cleaned.slice(shortcode.length);
  }

  // remove a leading "*" that separates shortcode from the rest
  if (cleaned.startsWith("*")) {
    cleaned = cleaned.slice(1);
  }

  return cleaned;
}