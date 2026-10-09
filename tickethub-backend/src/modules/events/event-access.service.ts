import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client.js';
import { eventStaff, events } from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';

export async function assertOrganizerOwnsEvent(
  eventId: number,
  organizerId: number,
) {
  const [event] = await db
    .select({ id: events.id })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)))
    .limit(1);

  if (!event) throw new AppError(404, 'Event not found');
}

export async function assertCanAccessEvent(params: {
  eventId: number;
  userId: number;
  roles: string[];
}) {
  if (params.roles.includes('organizer')) {
    const [event] = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          eq(events.id, params.eventId),
          eq(events.organizerId, params.userId),
        ),
      )
      .limit(1);

    if (event) return;
  }

  if (params.roles.includes('event_staff')) {
    const [staff] = await db
      .select({ id: eventStaff.id })
      .from(eventStaff)
      .where(
        and(
          eq(eventStaff.event_id, params.eventId),
          eq(eventStaff.staff_id, params.userId),
        ),
      )
      .limit(1);

    if (staff) return;
  }

  throw new AppError(403, 'You are not authorized to access this event.');
}
