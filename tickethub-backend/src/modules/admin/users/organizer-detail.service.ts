import { db } from '@/db/client.js';
import {
  events,
  payments,
  ticketOrders,
  ticketOrderItems,
  ticketOrderUserDetails,
  tickets,
  eventTickets,
  ticketTypes,
  ticketConfigurations,
  users,
  userRoles,
  roles,
} from '@/db/schema/index.js';
import { and, count, desc, eq, like, or, sql } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { applyDateRange, toUpperBound } from '@/utils/dateRange.js';
import type { OrganizerDetailListQueryType, OrganizerDetailQueryType } from './users.schema.js';

const latestPayment = sql`(SELECT p.id FROM ${payments} p WHERE p.orderId = ${ticketOrders.id} ORDER BY (p.status = 'Completed') DESC, p.id DESC LIMIT 1)`;

function scopedToOrganizer(organizerId: number, orderId: any) {
  return sql`EXISTS (
    SELECT 1 FROM ${ticketOrderItems} toi
    INNER JOIN ${eventTickets} et ON et.id = toi.eventTicketId
    INNER JOIN ${tickets} t ON t.id = et.ticketId
    INNER JOIN ${events} e ON e.id = t.eventId
    WHERE toi.orderId = ${orderId} AND e.organizerId = ${organizerId}
  )`;
}

function completedPaymentFilters(organizerId: number, from?: string, to?: string) {
  const filters: any[] = [eq(payments.status, 'Completed'), scopedToOrganizer(organizerId, payments.orderId)];
  applyDateRange(filters, payments.paidAt, { from, to });
  return filters;
}

function orderFilters(organizerId: number, params: OrganizerDetailListQueryType) {
  const dateExpr = sql`COALESCE(${payments.paidAt}, ${ticketOrders.createdAt})`;
  const filters: any[] = [scopedToOrganizer(organizerId, ticketOrders.id)];
  if (params.from) filters.push(sql`${dateExpr} >= ${params.from}`);
  if (params.to) filters.push(sql`${dateExpr} <= ${toUpperBound(params.to)}`);
  if (params.search?.trim()) {
    const pattern = `%${params.search.trim()}%`;
    filters.push(or(
      like(ticketOrderUserDetails.email, pattern),
      like(ticketOrderUserDetails.firstName, pattern),
      like(ticketOrderUserDetails.lastName, pattern),
      like(ticketOrderUserDetails.phoneNumber, pattern),
      like(sql<string>`CONCAT(${ticketOrderUserDetails.firstName}, ' ', ${ticketOrderUserDetails.lastName})`, pattern),
    )!);
  }
  return filters;
}

function paginate<T>(data: T[], page: number, pageSize: number, total: number) {
  return { data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } };
}

export class OrganizerDetailService {
  async profile(organizerId: number) {
    const [profile] = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName, email: users.email,
      phoneNumber: users.phoneNumber, isVerified: users.isVerified, isActive: users.isActive,
      profileImage: users.profileImage, lastLogin: users.lastLogin, createdAt: users.createdAt,
      updatedAt: users.updatedAt, roleName: roles.name,
    }).from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(users.id, organizerId), eq(roles.name, 'organizer'))).limit(1);
    if (!profile) throw new AppError(404, 'Organizer not found');
    return profile;
  }

  async stats(organizerId: number, params: OrganizerDetailQueryType) {
    await this.profile(organizerId);
    const filters = completedPaymentFilters(organizerId, params.from, params.to);
    const [paymentAgg] = await db.select({
      totalOrders: sql<number>`COUNT(DISTINCT ${payments.orderId})`,
      totalAmount: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      totalFeeAmount: sql<string>`COALESCE(SUM(${payments.feeAmount}), 0)`,
    }).from(payments).where(and(...filters));
    const [ticketAgg] = await db.select({ totalTicketsSold: count(ticketOrderItems.id) })
      .from(ticketOrderItems).innerJoin(eventTickets, eq(eventTickets.id, ticketOrderItems.eventTicketId))
      .innerJoin(tickets, eq(tickets.id, eventTickets.ticketId)).innerJoin(events, eq(events.id, tickets.eventId))
      .innerJoin(payments, eq(payments.orderId, ticketOrderItems.orderId))
      .where(and(eq(events.organizerId, organizerId), ...filters));
    const [eventAgg] = await db.select({
      totalEvents: count(events.id),
      publishedEvents: sql<number>`SUM(CASE WHEN ${events.status} = 'Published' THEN 1 ELSE 0 END)`,
    }).from(events).where(eq(events.organizerId, organizerId));
    const totalOrders = Number(paymentAgg?.totalOrders ?? 0);
    const totalAmount = Number(paymentAgg?.totalAmount ?? 0);
    return { totalOrders, totalAmount, totalFeeAmount: Number(paymentAgg?.totalFeeAmount ?? 0),
      totalTicketsSold: Number(ticketAgg?.totalTicketsSold ?? 0), totalEvents: Number(eventAgg?.totalEvents ?? 0),
      publishedEvents: Number(eventAgg?.publishedEvents ?? 0), averageOrderValue: totalOrders ? totalAmount / totalOrders : 0 };
  }

  async events(organizerId: number, params: OrganizerDetailListQueryType) {
    await this.profile(organizerId);
    const page = params.page || 1, pageSize = params.pageSize || 10, where = eq(events.organizerId, organizerId);
    const [totalResult] = await db.select({ count: count() }).from(events).where(where);
    const data = await db.select({
      id: events.id, slug: events.slug, title: events.title, status: events.status,
      approvalStatus: events.approvalStatus, dateAndTime: events.dateAndTime, capacity: events.capacity,
      createdAt: events.createdAt, ticketsSold: sql<number>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Completed' THEN 1 ELSE 0 END), 0)`,
      grossSales: sql<string>`COALESCE(SUM(CASE WHEN ${payments.status} = 'Completed' THEN ${ticketConfigurations.price} ELSE 0 END), 0)`,
    }).from(events).leftJoin(tickets, eq(tickets.eventId, events.id))
      .leftJoin(eventTickets, eq(eventTickets.ticketId, tickets.id))
      .leftJoin(ticketConfigurations, eq(ticketConfigurations.id, eventTickets.ticketConfigurationId))
      .leftJoin(ticketOrderItems, eq(ticketOrderItems.eventTicketId, eventTickets.id))
      .leftJoin(payments, and(eq(payments.orderId, ticketOrderItems.orderId), eq(payments.status, 'Completed')))
      .where(where).groupBy(events.id).orderBy(desc(events.createdAt)).limit(pageSize).offset((page - 1) * pageSize);
    return paginate(data, page, pageSize, Number(totalResult?.count ?? 0));
  }

  async orders(organizerId: number, params: OrganizerDetailListQueryType) {
    await this.profile(organizerId);
    const page = params.page || 1, pageSize = params.pageSize || 10, filters = orderFilters(organizerId, params);
    const [totalResult] = await db.select({ count: sql<number>`COUNT(DISTINCT ${ticketOrders.id})` }).from(ticketOrders)
      .leftJoin(payments, eq(payments.id, latestPayment)).innerJoin(ticketOrderUserDetails, eq(ticketOrderUserDetails.orderId, ticketOrders.id))
      .where(and(...filters));
    const data = await db.select({
      orderId: ticketOrders.id, status: ticketOrders.status, customerFirstName: ticketOrderUserDetails.firstName,
      customerLastName: ticketOrderUserDetails.lastName, customerEmail: ticketOrderUserDetails.email,
      phoneNumber: ticketOrderUserDetails.phoneNumber, quantity: ticketOrders.quantity, amount: payments.amount,
      feeAmount: payments.feeAmount, subtotal: payments.subtotal, currency: payments.currency, provider: payments.provider,
      paymentStatus: payments.status, reference: payments.reference, paidAt: payments.paidAt, purchasedAt: ticketOrders.createdAt,
      events: sql<string>`GROUP_CONCAT(DISTINCT ${events.title} SEPARATOR ', ')`,
      ticketTypes: sql<string>`GROUP_CONCAT(DISTINCT ${ticketTypes.name} SEPARATOR ', ')`, totalTickets: count(ticketOrderItems.id),
    }).from(ticketOrders).leftJoin(payments, eq(payments.id, latestPayment))
      .innerJoin(ticketOrderUserDetails, eq(ticketOrderUserDetails.orderId, ticketOrders.id))
      .innerJoin(ticketOrderItems, eq(ticketOrderItems.orderId, ticketOrders.id)).innerJoin(eventTickets, eq(eventTickets.id, ticketOrderItems.eventTicketId))
      .innerJoin(tickets, eq(tickets.id, eventTickets.ticketId)).innerJoin(ticketTypes, eq(ticketTypes.id, eventTickets.ticketTypeId))
      .innerJoin(events, eq(events.id, tickets.eventId)).where(and(...filters)).groupBy(ticketOrders.id, payments.id, ticketOrderUserDetails.id)
      .orderBy(desc(sql`COALESCE(${payments.paidAt}, ${ticketOrders.createdAt})`)).limit(pageSize).offset((page - 1) * pageSize);
    return paginate(data, page, pageSize, Number(totalResult?.count ?? 0));
  }
}

export default new OrganizerDetailService();

