import { db } from '@/db/client.js';
import { eq, and, or, like } from 'drizzle-orm';
import {
  eventStaff,
  users,
  events,
  roles,
  userRoles,
} from '@/db/schema/index.js';
import { generateStaffInviteToken } from '@/modules/auth/auth.utils.js';
import { sendMail } from '@/modules/emails/emails.service.js';
import { buildStaffAssignmentHtml } from '@/modules/emails/templates/staffAssignment.template.js';
import config from '@/config/config.js';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';
import logger from '@/utils/logger/index.js';

export async function getEventStaff(eventId: number) {
  const data = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      assignedAt: eventStaff.assigned_at,
    })
    .from(eventStaff)
    .innerJoin(users, eq(eventStaff.staff_id, users.id))
    .where(eq(eventStaff.event_id, eventId))
    .orderBy(eventStaff.assigned_at);

  return data;
}

export async function getOrganizerStaff(organizerId: number, search?: string) {
  const filters: ReturnType<typeof eq>[] = [eq(roles.name, 'event_staff'), eq(events.organizerId, organizerId)];

  if (search) {
    filters.push(
      or(
        like(users.firstName, `%${search}%`),
        like(users.lastName, `%${search}%`),
        like(users.email, `%${search}%`),
      )!,
    );
  }

  const data = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
    })
    .from(users)
    .innerJoin(userRoles, eq(users.id, userRoles.userId))
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .innerJoin(eventStaff, eq(users.id, eventStaff.staff_id))
    .innerJoin(events, eq(eventStaff.event_id, events.id))
    .where(and(...filters))
    .groupBy(users.id);

  return data;
}

export async function assignStaffToEvent(
  eventId: number,
  staffUserIds: number[],
  organizerId: number,
) {
  const [event] = await db
    .select({
      id: events.id,
      title: events.title,
      dateAndTime: events.dateAndTime,
    })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.organizerId, organizerId)))
    .limit(1);

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  const results: {
    userId: number;
    email: string;
    success: boolean;
    reason?: string;
  }[] = [];

  for (const userId of staffUserIds) {
    const [user] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      results.push({ userId, email: '', success: false, reason: 'User not found' });
      continue;
    }

    const [existing] = await db
      .select({ id: eventStaff.id })
      .from(eventStaff)
      .where(and(eq(eventStaff.event_id, eventId), eq(eventStaff.staff_id, userId)))
      .limit(1);

    if (existing) {
      results.push({ userId, email: user.email, success: false, reason: 'Already assigned' });
      continue;
    }

    await db.insert(eventStaff).values({
      event_id: eventId,
      staff_id: userId,
      assigned_by: organizerId,
      assigned_at: now(),
    });

    try {
      const dashboardUrl = `${config.appUrl}/dashboard`;
      await sendMail(
        user.email,
        `You've been assigned to ${event.title}`,
        `You have been assigned as event staff for ${event.title}. Log in to your dashboard to check in attendees.`,
        buildStaffAssignmentHtml(event.title, event.dateAndTime, dashboardUrl),
      );
    } catch (err) {
      logger.error(`Failed to send assignment email to ${user.email}: ${err}`);
    }

    results.push({ userId, email: user.email, success: true });
  }

  return results;
}

export async function generateStaffInviteLink(
  eventId: number,
  organizerId: number,
) {
  const token = generateStaffInviteToken(organizerId, eventId);
  const inviteUrl = `${config.appUrl}/signup?token=${token}`;

  return { inviteUrl };
}
