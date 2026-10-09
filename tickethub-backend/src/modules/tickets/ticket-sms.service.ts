import { sendTicket } from '@/modules/ussd-payment/ussd-payment.utils.js';

const MAX_SMS_LENGTH = 1200;

export interface TicketSmsItem {
  eventName: string;
  ticketIdentifier: string;
  qrCodeUrl: string;
  ticketName?: string | null;
  ticketType?: string | null;
}

export interface TicketSmsOptions {
  attendeeName?: string;
  orderId?: number;
}

function ticketLabel(ticket: TicketSmsItem) {
  return ticket.ticketType || ticket.ticketName || 'Ticket';
}

function buildTicketLine(ticket: TicketSmsItem, index: number) {
  return (
    `${index + 1}. ${ticket.eventName}\n` +
    `Type: ${ticketLabel(ticket)}\n` +
    `ID: ${ticket.ticketIdentifier}\n` +
    `Link: ${ticket.qrCodeUrl}`
  );
}

function buildHeader(count: number, options: TicketSmsOptions) {
  const name = options.attendeeName?.trim();
  const greeting = name ? `Hi ${name}, ` : '';
  const orderText = options.orderId ? ` for order #${options.orderId}` : '';
  return `${greeting}your TicketHub tickets${orderText} (${count}):`;
}

export function buildTicketSmsMessages(
  tickets: TicketSmsItem[],
  options: TicketSmsOptions = {},
) {
  if (tickets.length === 0) return [];

  const header = buildHeader(tickets.length, options);
  const messages: string[] = [];
  let current = header;

  tickets.forEach((ticket, index) => {
    const line = buildTicketLine(ticket, index);
    const next = `${current}\n\n${line}`;

    if (current !== header && next.length > MAX_SMS_LENGTH) {
      messages.push(current);
      current = `${header}\n\n${line}`;
      return;
    }

    current = next;
  });

  messages.push(current);
  return messages;
}

export async function sendTicketSmsMessages(
  phoneNumber: string,
  tickets: TicketSmsItem[],
  options: TicketSmsOptions = {},
) {
  const messages = buildTicketSmsMessages(tickets, options);
  if (messages.length === 0) return false;

  const results = await Promise.allSettled(
    messages.map((message) => sendTicket(phoneNumber, message)),
  );

  return results.every(
    (result) => result.status === 'fulfilled' && result.value === true,
  );
}