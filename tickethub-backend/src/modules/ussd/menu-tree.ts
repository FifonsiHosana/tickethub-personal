import config from '@/config/config.js';
import type { PaystackPaymentFields } from '../ussd-payment/ussd-payment.types.js';
import { getCategories, getCategoryEvents } from './ussd.services.js';
import type { EventDetails, MenuNode } from './ussd.types.js';
import {
  categoryId,
  categoryName,
  dateTimeFormat,
  eventName,
  numberOfTickets,
  singleTicketPrice,
  ticketsRemaining,
  ticketType,
  totalPrice,
} from './ussd.utils.js';
import { initiatePayment } from '../ussd-payment/ussd-payment.service.js';

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
      const more = events.length === 5 ? '\n#.See more' : '';
      const less = page !== '0' ? '\n##.Go back in the list' : '';

      return `Select an Event from ${categoryName(context)}\n ${events.map((events, index: number) => `${index + 1}. ${events.name}${more}${less}`)}`;
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
      `Confirm Event Details\nEvent: ${eventName(context)}\nTime: ${dateTimeFormat((context.eventDetails as EventDetails).time)}\nLocation: ${(context.eventDetails as EventDetails).location}\n1. Confirm\n2. Leave to main menu`,
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
    prompt: async (context) =>
      `${eventName(context)}\nSelect Ticket Type\n${(
        context.eventDetails as EventDetails
      ).ticketTypes
        .filter((ticket) => ticket.remaining > 0)
        .map((ticket, index) => {
          const isLowStock = ticket.remaining < ticket.totalCount / 2;

          return `${index + 1}. ${ticket.name} - GHC ${ticket.price} (${ticket.remaining}${isLowStock ? ' only' : ''} remaining)`;
        })
        .join('\n')}`,
    data: 'ticketType',
    next: 'NumberOfTickets',
    resolve: (input, context) => {
      const selected = (context.eventDetails as EventDetails).ticketTypes[
        Number(input) - 1
      ];
      return selected
        ? String(
            selected.id +
              `*${selected.name}*${selected.price}*${selected.remaining}`,
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
      `Confirmation Page\n\nEvent: ${eventName(context)}\nTicket: ${ticketType(context)}\nTotal:${numberOfTickets(context) > 1 ? ` ${singleTicketPrice(context)} x ${numberOfTickets(context)} =` : ''} GHC ${totalPrice(context)}\nFor: ${context.data?.receiveNumber ?? context.phoneNumber}\n1. Confirm`,
    options: {
      '1': 'paymentInitiation',
      '2': 'Cancel',
    },
    isTerminal: false,
    action: true,
    onSelect: {
      '1': async (context) => {
        const fields: PaystackPaymentFields = {
          amount: totalPrice(context),
          email: config.email.from_email,
          currency: 'GHS',
          mobile_money: {
            phone: context.phoneNumber,
            provider: context.telcoProvider,
          },
          metadata: {
            phoneNumber: context.phoneNumber,
            receiveNumber: context.data?.receiveNumber,
          },
        };
        try {
          await initiatePayment(fields);
        } catch (error) {
          console.log(error);
        }
      },
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
