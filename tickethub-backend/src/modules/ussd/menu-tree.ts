import config from '@/config/config.js';
import type { PaystackPaymentFields } from '../ussd-payment/ussd-payment.types.js';
import {
  ticketType,
  singleTicketPrice,
  ticketsRemaining,
  numberOfTickets,
  totalPrice,
  eventName,
  categoryId,
  categoryName,
  dateTimeFormat,
} from './ussd.utils.js';
import type { EventDetails, MenuNode } from './ussd.types.js';
import TicketsService from '../tickets/tickets.service.js';
import { initiatePayment } from '../ussd-payment/ussd-payment.service.js';
import { getCategories, getCategoryEvents } from './ussd.services.js';
import type { sessionContext } from './ussd.types.js';
import { toPaystackProvider } from '../ussd-payment/ussd-payment.utils.js';

type AvailableTicket = NonNullable<EventDetails['ticketTypes'][number]> & {
  remaining: number;
};

/** Tickets that can actually be sold (mapping exists and stock remains). */
function availableTicketTypes(context: sessionContext): AvailableTicket[] {
  const all = (context.eventDetails as EventDetails).ticketTypes ?? [];
  return all.filter(
    (t): t is AvailableTicket =>
      t != null && Number(t.remaining) > 0 && t.id != null,
  );
}

/** Ticket types are shown 3 per screen to fit small USSD displays. */
const TICKET_TYPES_PAGE_SIZE = 3;

function ticketTypePage(context: sessionContext): number {
  return Number(context.data?.['page:selectTicketType'] ?? '0');
}

function ticketTypePageSlice(context: sessionContext): AvailableTicket[] {
  const available = availableTicketTypes(context);
  const page = ticketTypePage(context);
  return available.slice(
    page * TICKET_TYPES_PAGE_SIZE,
    page * TICKET_TYPES_PAGE_SIZE + TICKET_TYPES_PAGE_SIZE,
  );
}

export const tree: Record<string, MenuNode> = {
  home: {
    id: 'home',
    prompt: async ({}) =>
      'Welcome to TicketHub\n\nPlease select an option:\n\n1: View Events\n2: My Account\n3: Help',
    options: { '1': 'viewEvents', '2': 'myTickets', '3': 'help' },
    isTerminal: false,
  },
  viewEvents: {
    id: 'view-events',
    prompt: async (context) => {
      const page = context.data?.['page:viewEvents'] ?? '0';
      const categories = await getCategories(page);
      const items = categories.map((c, i) => `${i + 1}. ${c.name}`).join('\n');
      const more = categories.length === 5 ? '\n#.See More' : '';
      return `Select Category:\n${items}${more}`;
    },
    resolve: async (input, context) => {
      const page = context.data?.['page:viewEvents'] ?? '0';
      const categories = await getCategories(page);
      const selected = categories[Number(input) - 1];
      const category = `${selected?.id}*${selected?.name}`;

      return selected ? category : undefined;
    },
    data: 'category',
    paginate: {
      moreOption: '#',
      seeLess: '##',
    },
    isTerminal: false,
    next: 'categoryEvents',
  },
  categoryEvents: {
    id: 'category-events',
    prompt: async (context) => {
      const page = context.data?.['categoryEvents'] ?? '0';

      const events = await getCategoryEvents(categoryId(context), page);
      const items = events
        .map((event, index: number) => `${index + 1}. ${event.name}`)
        .join('\n');
      const more = events.length === 5 ? '\n#.See more' : '';
      const less = page !== '0' ? '\n##.Go back in the list' : '';

      return `Select an Event from ${categoryName(context)}\n${items}${more}${less}`;
    },
    resolve: async (input, context) => {
      const events = await getCategoryEvents(
        categoryId(context),
        context.data.page,
      );
      const selected = events[Number(input) - 1];
      return selected ? String(selected.id) : undefined;
    },
    data: 'eventId',
    paginate: {
      moreOption: '#',
      seeLess: '##',
    },
    next: 'root',
  },
  myTickets: {
    id: 'my-account',
    prompt: async (context) =>
      `My Tickets\n${context.phoneNumber}\n\nStill under construction come back :)`,
    isTerminal: true,
  },
  help: {
    id: 'help',
    prompt: async () =>
      'Help\nThis is a USSD flow to help you buy tickets from tickethubgh! Contact the team at tickethubgh@support.com',
    isTerminal: true,
  },
  // Specific event flow ------------------------------------------------------------------
  root: {
    id: 'event-root',
    prompt: async (context) =>
      ` ${eventName(context)}\n
    ${(context.eventDetails as EventDetails).location}
     ${dateTimeFormat((context.eventDetails as EventDetails).time)}\n
      \n1. Buy Ticket\n2. Leave to main menu`,
    options: { '1': 'selectTicketType', '2': 'home' },
    onSelect: {
      '2': async (context) => {
        context.eventDetails = undefined;
      },
    },
    isTerminal: false,
  },
  selectTicketType: {
    id: 'select-ticket-type',
    prompt: async (context) => {
      const available = availableTicketTypes(context);
      if (available.length === 0) {
        return `${eventName(context)}\nSorry, tickets for this event are sold out.`;
      }
      const page = ticketTypePage(context);
      const slice = ticketTypePageSlice(context);
      const lines = slice
        .map(
          (ticket, index) =>
            `${index + 1}. ${ticket.name} - GHC ${ticket.price}`,
        )
        .join('\n');
      const more =
        (page + 1) * TICKET_TYPES_PAGE_SIZE < available.length
          ? '\n#. More'
          : '';
      const less = page > 0 ? '\n##. Less' : '';
      return `${eventName(context)} Tickets\n${lines}${more}${less}`;
    },
    data: 'ticketType',
    next: 'NumberOfTickets',
    paginate: {
      moreOption: '#',
      seeLess: '##',
    },
    resolve: (input, context) => {
      const selected = ticketTypePageSlice(context)[Number(input) - 1];
      // First segment must be the EventTickets row id (what purchaseTickets
      // expects as eventTicketId), NOT the ticket-type id.

      const eventTicketId = selected?.eventTicketId;

      return selected
        ? String(
            `${eventTicketId}*${selected.name}*${Number(selected.price)}*${selected.remaining}`,
          )
        : undefined;
    },
    isTerminal: false,
  },
  NumberOfTickets: {
    id: 'number-of-tickets',
    prompt: async () =>
      'Enter number of tickets to purchase(You can only purchase 10 at a time)\n',
    data: 'numberOfTickets',
    resolve: (input, context) => {
      const n = Number(input);
      if (
        !Number.isInteger(n) ||
        n < 1 ||
        n > 10 ||
        n > ticketsRemaining(context)
      ) {
        return undefined;
      }
      return String(n);
    },
    next: 'buyFor',
    isTerminal: false,
  },
  buyFor: {
    id: 'buy-for',
    prompt: async (context) => `${ticketType(context)}\n1: Buy for Self\n`, // swap out for the selected ticket type from redis
    options: {
      '1': 'Confirmation',
    },
    isTerminal: false,
  },
  Confirmation: {
    id: 'confirmation',
    prompt: async (context) =>
      `Confirmation \n\nEvent: ${eventName(context)}\nTicket: ${ticketType(context)}\n
    Total:${numberOfTickets(context) > 1 ? ` ${singleTicketPrice(context)} x ${numberOfTickets(context)} =` : ''} 
    GHC ${totalPrice(context)}\nFor: ${context.data?.receiveNumber ?? context.phoneNumber}\n1. Confirm`,
    options: {
      '1': 'paymentInitiation',
      '2': 'Cancel',
    },
    isTerminal: false,
    action: true,
    onSelect: {
      '1': async (context) => {
        // Create a pending order before charging
        const numberOfTicketsVal = numberOfTickets(context);
        const attendee = {
          firstName: 'USSD',
          lastName: 'Customer',
          phoneNumber: context.phoneNumber,
          // Build email as ussd+<sanitized phone number>@tickethub.local
          email: `ussd+${context.phoneNumber.replace(/[^a-zA-Z0-9]/g, '')}@tickethub.local`,
        };

        // Generate eventTicketId from the selected ticket type data
        const ticketTypeStr = context.data?.ticketType;
        const ticketTypeParts = ticketTypeStr?.split('*');
        const eventTicketId = ticketTypeParts
          ? Number(ticketTypeParts[0])
          : undefined;

        if (!eventTicketId) {
          throw new Error('Missing eventTicketId from ticket type selection');
        }

        const ticketQuantity = numberOfTicketsVal || 1;

        // Create pending order with placeholder identity
        const purchaseResult = await TicketsService.purchaseTickets(
          {
            items: [
              {
                eventTicketId,
                quantity: ticketQuantity,
              },
            ],
            attendee,
          },
          null, // userId can be null for USSD guest orders
        );

        const orderId = purchaseResult.orderId;

        // Build payment fields with orderId in metadata
        const fields: PaystackPaymentFields = {
          amount: totalPrice(context) * 100,
          email: 'info@tickethubgh.com',
          currency: 'GHS',
          // channels: ['mobile_money'],
          mobile_money: {
            phone: context.phoneNumber,
            provider: toPaystackProvider(context.telcoProvider),
          },
          metadata: {
            phoneNumber: context.phoneNumber,
            receiveNumber: context.data?.receiveNumber,
            orderId: orderId as number,
            ussd: true,
            totalQuantity: ticketQuantity,
          },
        };

        try {
          await initiatePayment(fields);
        } catch (error) {
          console.log(error);
          throw error;
        }
      },
      // '2': 'Cancel',
    },
  },
  buyForSomeone: {
    id: 'buy-for-someone',
    prompt: () => `Enter number of the receiver.`,
    data: 'receiveNumber',
    next: 'Confirmation',
  },
  paymentInitiation: {
    id: 'payment-initiation',
    prompt: async () => `Your transaction has been
 successfully initiated. You will be
 prompted to approve your
 purchase on your phone`,
    isTerminal: true,
  },
};
