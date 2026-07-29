import { db } from '@/db/client.js';
import {
  events,
  eventsVenues,
  eventImages,
  users,
  category,
  categorizedEvents,
} from '@/db/schema/index.js';
import { and, eq, like, count, desc } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';
import type { ListAdminEventsQueryType } from './events.schema.js';

export class EventsService {
  async list(params: ListAdminEventsQueryType) {
    const { page, pageSize, search, approvalStatus, status, organizerId } =
      params;
    const offset = (page - 1) * pageSize;

    const filters: any[] = [];

    if (search) filters.push(like(events.title, `%${search}%`));
    if (approvalStatus) filters.push(eq(events.approvalStatus, approvalStatus));
    if (status) filters.push(eq(events.status, status));
    if (organizerId) filters.push(eq(events.organizerId, organizerId));

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(events)
      .where(whereClause);

    const data = await db
      .select({
        id: events.id,
        title: events.title,
        status: events.status,
        approvalStatus: events.approvalStatus,
        dateAndTime: events.dateAndTime,
        capacity: events.capacity,
        venueName: eventsVenues.venue_name,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
        organizerEmail: users.email,
        createdAt: events.createdAt,
      })
      .from(events)
      .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(whereClause)
      .orderBy(desc(events.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: Number(totalResult?.count ?? 0),
        totalPages: Math.ceil(Number(totalResult?.count ?? 0) / pageSize),
      },
    };
  }

  async getDetail(eventId: number) {
    const [event] = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        status: events.status,
        approvalStatus: events.approvalStatus,
        dateAndTime: events.dateAndTime,
        capacity: events.capacity,
        termsAndConditions: events.termsAndConditions,
        venueName: eventsVenues.venue_name,
        address: eventsVenues.address,
        city: eventsVenues.city_or_town,
        country: eventsVenues.country,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
        organizerEmail: users.email,
        organizerId: events.organizerId,
        createdAt: events.createdAt,
      })
      .from(events)
      .leftJoin(eventsVenues, eq(events.eventVenueId, eventsVenues.id))
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) throw new AppError(404, 'Event not found');

    const images = await db
      .select({ imageUrl: eventImages.imageUrl, type: eventImages.type })
      .from(eventImages)
      .where(eq(eventImages.eventId, eventId));

    const categoryRows = await db
      .select({ id: category.id, name: category.name })
      .from(categorizedEvents)
      .innerJoin(category, eq(categorizedEvents.category_id, category.id))
      .where(eq(categorizedEvents.event_id, eventId));

    return { ...event, images, categories: categoryRows };
  }

  async approve(eventId: number, adminId: number) {
    const [event] = await db
      .select({ id: events.id, approvalStatus: events.approvalStatus })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) throw new AppError(404, 'Event not found');
    if (event.approvalStatus === 'Approved') {
      throw new AppError(400, 'Event is already approved');
    }

    await db
      .update(events)
      .set({
        approvalStatus: 'Approved',
        status: 'Published',
        approvedBy: adminId,
        approvedAt: now(),
        updatedAt: now(),
      })
      .where(eq(events.id, eventId));

    return { message: 'Event approved and published' };
  }

  async reject(eventId: number, reason: string) {
    const [event] = await db
      .select({ id: events.id, approvalStatus: events.approvalStatus })
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) throw new AppError(404, 'Event not found');
    if (event.approvalStatus !== 'Pending') {
      throw new AppError(400, 'Only pending events can be rejected');
    }

    await db
      .update(events)
      .set({
        approvalStatus: 'Rejected',
        status: 'Draft',
        updatedAt: now(),
      })
      .where(eq(events.id, eventId));

    return { message: 'Event rejected', reason };
  }
}

export default new EventsService();
