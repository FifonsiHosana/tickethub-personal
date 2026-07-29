import { db } from '@/db/client.js';
import {
  users,
  roles,
  userRoles,
  events,
  payments,
  payouts,
  tickets,
  eventTickets,
  ticketConfigurations,
} from '@/db/schema/index.js';
import { and, eq, count, sql, gte, lte } from 'drizzle-orm';

export class AnalyticsService {
  async getOverview() {
    const [userCounts] = await db
      .select({
        total: count(),
        organizers: sql<number>`SUM(CASE WHEN ${roles.name} = 'organizer' THEN 1 ELSE 0 END)`,
        attendees: sql<number>`SUM(CASE WHEN ${roles.name} = 'attendee' THEN 1 ELSE 0 END)`,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.isActive, true));

    const [eventCount] = await db.select({ count: count() }).from(events);

    const [pendingApprovals] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.approvalStatus, 'Pending'));

    const [revenue] = await db
      .select({ total: sql<string>`COALESCE(SUM(${payments.amount}), 0)` })
      .from(payments)
      .where(eq(payments.status, 'Completed'));

    const [commission] = await db
      .select({ total: sql<string>`COALESCE(SUM(${payouts.commission}), 0)` })
      .from(payouts)
      .where(eq(payouts.status, 'Completed'));

    const [payoutTotal] = await db
      .select({ total: sql<string>`COALESCE(SUM(${payouts.amount}), 0)` })
      .from(payouts)
      .where(eq(payouts.status, 'Completed'));

    return {
      totalUsers: Number(userCounts?.total ?? 0),
      totalOrganizers: Number(userCounts?.organizers ?? 0),
      totalAttendees: Number(userCounts?.attendees ?? 0),
      totalEvents: Number(eventCount?.count ?? 0),
      pendingApprovals: Number(pendingApprovals?.count ?? 0),
      totalRevenue: Number(revenue?.total ?? 0),
      totalCommission: Number(commission?.total ?? 0),
      totalPayouts: Number(payoutTotal?.total ?? 0),
    };
  }

  async getRevenueTrend(from?: string, to?: string) {
    const filters: any[] = [eq(payments.status, 'Completed')];
    if (from) filters.push(gte(payments.paidAt, from));
    if (to) filters.push(lte(payments.paidAt, to));

    const data = await db
      .select({
        date: sql<string>`DATE(${payments.paidAt})`,
        revenue: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(and(...filters))
      .groupBy(sql`DATE(${payments.paidAt})`)
      .orderBy(sql`DATE(${payments.paidAt})`);

    return data.map((r) => ({ date: r.date, revenue: Number(r.revenue) }));
  }

  async getUserTrend(from?: string, to?: string) {
    const filters: any[] = [];
    if (from) filters.push(gte(users.createdAt, from));
    if (to) filters.push(lte(users.createdAt, to));

    const where = filters.length > 0 ? and(...filters) : undefined;

    const data = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(users)
      .where(where)
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`);

    return data.map((r) => ({ date: r.date, count: Number(r.count) }));
  }

  async getEventStats() {
    const statusCounts = await db
      .select({ status: events.status, count: count() })
      .from(events)
      .groupBy(events.status);

    const approvalCounts = await db
      .select({ status: events.approvalStatus, count: count() })
      .from(events)
      .groupBy(events.approvalStatus);

    return { statusCounts, approvalCounts };
  }

  async getOrganizerPerformance() {
    const data = await db
      .select({
        organizerId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        eventCount: sql<number>`COUNT(DISTINCT ${events.id})`,
        totalTicketsSold: sql<number>`COALESCE(SUM(${ticketConfigurations.totalSold}), 0)`,
      })
      .from(users)
      .innerJoin(
        userRoles,
        and(
          eq(userRoles.userId, users.id),
          eq(
            userRoles.roleId,
            sql`(SELECT id FROM Roles WHERE name = 'organizer')`,
          ),
        ),
      )
      .leftJoin(events, eq(events.organizerId, users.id))
      .leftJoin(tickets, eq(tickets.eventId, events.id))
      .leftJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
      .leftJoin(
        ticketConfigurations,
        eq(eventTickets.ticketConfigurationId, ticketConfigurations.id),
      )
      .groupBy(users.id, users.firstName, users.lastName, users.email)
      // .orderBy(sql`totalTicketsSold DESC`)
      .limit(20);

    return data;
  }
}

export default new AnalyticsService();
