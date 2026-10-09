import { sendMail } from '@/modules/emails/emails.service.js';
import { buildPurchaseConfirmationEmail } from '@/modules/emails/templates/ticketPurchase.template.js';
import { sendTicketSmsMessages } from '@/modules/tickets/ticket-sms.service.js';

interface IssuedTicket {
  ticketIdentifier: string;
  ticketType: string;
  ticketName: string;
  price: string;
  eventName: string;
  eventDate: string;
  venueName: string | null;
  qrCodeUrl: string;
}

export async function notifyCheckoutV2(params: {
  orderId: number;
  total: number;
  attendee?: { email: string; phoneNumber: string } | undefined;
  tickets: IssuedTicket[];
}) {
  if (!params.attendee || params.tickets.length === 0) return;

  const { html, attachments } = await buildPurchaseConfirmationEmail({
    orderId: params.orderId,
    total: params.total,
    items: params.tickets,
    accountCreated: false,
    email: params.attendee.email,
  });

  await Promise.allSettled([
    sendMail(
      params.attendee.email,
      'Your TicketHub Tickets',
      'Your ticket purchase has been confirmed',
      html,
      undefined,
      attachments,
    ),
    sendTicketSmsMessages(params.attendee.phoneNumber, params.tickets, {
      orderId: params.orderId,
    }),
  ]);
}
