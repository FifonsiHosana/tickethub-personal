import { randomUUID } from 'crypto';

export function generateTicketIdentifier(eventName: string) {
  const eventTitleShortener = eventName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return `${eventTitleShortener}-${randomUUID().substring(0, 6)}`;
}
