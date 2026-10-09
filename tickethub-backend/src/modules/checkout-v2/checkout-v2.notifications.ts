import { sendMail } from '@/modules/emails/emails.service.js';
import { buildPurchaseConfirmationEmail } from '@/modules/emails/templates/ticketPurchase.template.js';
import { sendTicket } from '@/modules/ussd-payment/ussd-payment.utils.js';

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

  const first = params.tickets[0]!;
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
    sendTicket(
      params.attendee.phoneNumber,
      `${first.eventName}\n\nTicket ID: ${first.ticketIdentifier}\n` +
        `Ticket Type: ${first.ticketType || first.ticketName}\n` +
        `Quantity: ${params.tickets.length}\n\nView Tickets: ${first.qrCodeUrl}`,
    ),
  ]);
}
