import { db } from '@/db/client.js';
import type {
  Category,
  CategoryEvent,
  EventDetails,
  MenuNode,
  TelcoProviders,
} from './ussd.types.js';
import {
  categorizedEvents,
  category,
  events,
  eventsVenues,
} from '@/db/schema/events.js';
import { and, eq, gt, lt, sql } from 'drizzle-orm';
import {
  eventTickets,
  ticketConfigurations,
  tickets,
  ticketTypes,
} from '@/db/schema/index.js';
import { clearSession, getSession, saveSession } from './session.service.js';
import { tree } from './menu-tree.js';
import { stripShortcode } from './ussd.utils.js';
import { redisClient } from '@/config/redis.config.js';

export const getEvent = async (
  eventId: number,
): Promise<EventDetails | undefined> => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const response = await db
      .select({
        id: events.id,
        name: events.title,
        time: events.dateAndTime,
        location: eventsVenues.venue_name,
        description: events.description,
        ticketTypes: sql<
          {
            id: number;
            name: string;
            price: number;
            remaining: number;
            totalCount: number;
            eventTicketId: number;
          }[]
        >`JSON_ARRAYAGG(
          CASE WHEN ${ticketTypes.id} IS NOT NULL THEN
            JSON_OBJECT(
              'id', ${ticketTypes.id},
              'name', ${ticketTypes.name},
              'price', ${ticketConfigurations.price},
              'remaining',${ticketConfigurations.totalRemaining},
              'totalCount',${ticketConfigurations.totalCount},
              'eventTicketId', ${eventTickets.id}
            )
          END
        )`,
      })
      .from(events)
      .innerJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .innerJoin(tickets, eq(events.id, tickets.eventId))
      .leftJoin(eventTickets, eq(tickets.id, eventTickets.ticketId))
      .leftJoin(ticketTypes, eq(ticketTypes.id, eventTickets.ticketTypeId))
      .leftJoin(
        ticketConfigurations,
        eq(ticketConfigurations.id, eventTickets.ticketConfigurationId),
      )
      .where(
        and(
          eq(events.id, eventId),
          gt(ticketConfigurations.salesEndDate, now),
          lt(ticketConfigurations.salesStartDate, now),
          gt(ticketConfigurations.totalRemaining, 0),
        ),
      )
      .groupBy(
        events.id,
        events.title,
        events.dateAndTime,
        eventsVenues.venue_name,
        events.description,
      )
      .limit(1);

    // const response = await db.select().from(tickets);

    const row = response[0];
    // console.log('row', row);
    // console.log('response', response);

    if (!row) return undefined;

    return row;
  } catch (error) {
    console.error('getEvent failed:', error);
    return undefined;
  }
};

export const getCategories = async (
  page: string,
  pageSize = 5,
): Promise<Category[]> => {
  const cacheKey = `categories:page:${page}`;
  const cachedCategories = await redisClient.get(cacheKey);
  if (cachedCategories) {
    return JSON.parse(cachedCategories) as Category[];
  }
  try {
    redisClient;
    const response = await db
      .selectDistinct({ name: category.name, id: category.id })
      .from(category)
      .innerJoin(
        categorizedEvents,
        eq(categorizedEvents.category_id, category.id),
      )
      .limit(pageSize)
      .offset(pageSize * Number(page));

    // console.log(response);

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 3600 });
    return response;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getCategoryEvents = async (
  categoryId: string,
  page: string,
  pageSize = 5,
): Promise<CategoryEvent[]> => {
  try {
    const cacheKey = `events:category:${categoryId}:page:${page}`; // also added missing `:` between categoryId and page
    const cachedEvents = await redisClient.get(cacheKey);
    if (cachedEvents) return JSON.parse(cachedEvents) as CategoryEvent[];

    const response = await db
      .select({ name: events.title, id: events.id })
      .from(events)
      .innerJoin(categorizedEvents, eq(categorizedEvents.event_id, events.id))
      .innerJoin(category, eq(category.id, categorizedEvents.category_id))
      .where(eq(category.id, Number(categoryId)))
      .offset(Number(page) * pageSize)
      .limit(pageSize);

    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 120 }); // TTL added
    return response;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const handleUssd = async (
  sessionId: string,
  text: string,
  phoneNumber: string,
  telcoProvider: TelcoProviders,
  userId: string,
  isFirstRequest: boolean,
) => {
  const session = await getSession(sessionId);
  if (session.stack.length === 0) {
    session.stack.push('root');
  }

  const shortcode = '920*658';
  const currentNodeId = session.stack[session.stack.length - 1];
  const currentNode = tree[currentNodeId as string];

  if (!currentNode) {
    session.stack = ['root'];
    session.data = {};
    await saveSession(sessionId, session);
    const rootContext = {
      sessionId,
      data: session.data,
      phoneNumber,
      telcoProvider,
      eventDetails: session.eventDetails as EventDetails,
    };
    return {
      USERID: userId,
      MSISDN: phoneNumber,
      MSG: `Something went wrong. Let's start over.\n${await (tree['root'] as MenuNode).prompt(rootContext)}`,
      MSGTYPE: true,
    };
  }

  let rawEventId: string | undefined;
  let lastInput: string;
  let hasInput: boolean;

  if (isFirstRequest) {
    const cleaned = stripShortcode(text, shortcode);
    // console.log('RAW TEXT (first request):', JSON.stringify(text));
    // console.log('CLEANED:', JSON.stringify(cleaned));

    // First segment (if any) is a deep-linked event id; only segments
    // after it count as menu input (e.g. *920*658*28# -> event 28, no input).
    const parts = cleaned.split('*');
    rawEventId = parts[0] === '' ? undefined : parts[0];
    const rest = parts.slice(1).filter((p) => p !== '');
    lastInput = rest.length > 0 ? (rest[rest.length - 1] as string) : '';
    hasInput = rest.length > 0;
  } else {
    console.log('RAW TEXT (continuing):', JSON.stringify(text));
    lastInput = text;
    hasInput = text !== '' && text !== undefined;
  }

  let errorMessage = '';

  if (currentNodeId === 'root' && !session.eventDetails) {
    if (rawEventId !== undefined && rawEventId !== '') {
      const eventId = Number(rawEventId);
      const eventdetails = !Number.isNaN(eventId)
        ? await getEvent(eventId)
        : undefined;

      console.log('eventId', eventId);
      console.log('eventdetails', eventdetails);

      if (!eventdetails) {
        await saveSession(sessionId, session);
        return {
          USERID: userId,
          MSISDN: phoneNumber,
          MSG: 'Invalid event. Please try again.',
          MSGTYPE: false,
        };
      }
      session.eventDetails = eventdetails;
    } else {
      session.stack = ['home'];
    }
  }

  // The stack may have been reassigned above (root -> home), so resolve
  // the node to process input against from the current stack top.
  const activeNodeId = session.stack[session.stack.length - 1] as string;
  const activeNode = tree[activeNodeId] ?? currentNode;

  if (hasInput) {
    const context = {
      sessionId,
      data: session.data,
      phoneNumber,
      telcoProvider,
      eventDetails: session.eventDetails as EventDetails,
    };

    if (activeNode.paginate && lastInput === activeNode.paginate.moreOption) {
      const pageKey = `page:${activeNodeId}`;
      const currentPage = Number(session.data[pageKey] ?? '0');
      session.data[pageKey] = String(currentPage + 1);
    } else if (
      activeNode.paginate &&
      lastInput === activeNode.paginate.seeLess
    ) {
      const pageKey = `page:${activeNodeId}`;
      const currentPage = Number(session.data[pageKey] ?? '0');
      session.data[pageKey] = String(Math.max(currentPage - 1, 0));
    } else if (activeNode.data) {
      if (lastInput === '0') {
        if (session.stack.length > 1) session.stack.pop();
      } else if (lastInput === '00') {
        session.stack = session.eventDetails ? ['root'] : ['home'];
        session.data = {};
      } else {
        const rawInput = lastInput;

        const value = activeNode.resolve
          ? await activeNode.resolve(rawInput, context)
          : rawInput;

        if (value === undefined) {
          errorMessage = activeNode.invalidMessage ?? 'Invalid choice.\n';
        } else {
          session.data[activeNode.data] = value;

          if (activeNode.data === 'eventId' && !session.eventDetails) {
            const eventDetails = await getEvent(Number(value));
            if (!eventDetails) {
              errorMessage = 'Invalid event. Please try again.\n';
            } else {
              session.eventDetails = eventDetails;
            }
          }

          if (!errorMessage) {
            if (!activeNode.next) {
              throw new Error(
                `Node "${activeNodeId}" has data but no next node defined`,
              );
            }
            session.stack.push(activeNode.next);
          }
        }
      }
    } else if (lastInput === '00') {
      session.stack = session.eventDetails ? ['root'] : ['home'];
      session.data = {};
    } else if (lastInput === '0') {
      if (session.stack.length > 1) session.stack.pop();
    } else if (activeNode.options?.[lastInput]) {
      const action = activeNode.onSelect?.[lastInput];
      // An onSelect handler may return a node id to override the default target
      const override = action ? await action(context) : undefined;

      if (activeNode.options[lastInput] === 'home') {
        session.eventDetails = undefined;
      }

      const target =
        typeof override === 'string'
          ? override
          : (activeNode.options[lastInput] as string);

      if (typeof override === 'string') {
        // A charge has been initiated: reset the stack so "0. Back" can't
        // return to Confirmation and trigger a second order/charge.
        session.stack = [target];
      } else {
        session.stack.push(target);
      }
    } else {
      errorMessage = 'Invalid choice.\n';
    }
  }

  const node = tree[session.stack[session.stack.length - 1] as string];
  const finalContext = {
    sessionId,
    data: session.data,
    phoneNumber,
    telcoProvider,
    eventDetails: session.eventDetails as EventDetails,
  };

  if (!node) {
    session.stack = ['root'];
    await saveSession(sessionId, session);
    return {
      USERID: userId,
      MSISDN: phoneNumber,
      MSG: `Something went wrong. Let's start over.\n${await (tree['root'] as MenuNode).prompt(finalContext)}`,
      MSGTYPE: true,
    };
  }

  const message = await node.prompt(finalContext);

  if (node.isTerminal) {
    await clearSession(sessionId);
    return {
      USERID: userId,
      MSISDN: phoneNumber,
      MSG: message,
      MSGTYPE: false,
    };
  }

  await saveSession(sessionId, session);
  const renderedNodeId = session.stack[session.stack.length - 1];
  const backLineConditions =
    renderedNodeId !== 'root' && session.stack.length > 1;
  const backLine = backLineConditions ? '\n0. Back  00. Main menu' : '';

  return {
    USERID: userId,
    MSISDN: phoneNumber,
    MSG: `${errorMessage}${message}${backLine}`,
    MSGTYPE: true,
  };
};
