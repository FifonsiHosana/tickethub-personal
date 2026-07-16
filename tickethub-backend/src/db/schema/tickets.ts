import {
  mysqlTable,
  varchar,
  datetime,
  int,
  decimal,
  mysqlEnum,
  boolean,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { events } from './events.js';
import { users } from './auth.js';

export const tickets = mysqlTable('Tickets', {
  id: int().autoincrement().notNull().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  eventId: int().references(() => events.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  createdAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
  updatedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
});

export const ticketTypes = mysqlTable('TicketTypes', {
  id: int().autoincrement().notNull().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 255 }),
});

export const ticketConfigurations = mysqlTable('TicketConfigurations', {
  id: int().autoincrement().notNull().primaryKey(),
  price: decimal({
    precision: 10,
    scale: 2,
  }).notNull(),
  totalCount: int().notNull(),
  totalSold: int().notNull(),
  totalRemaining: int().notNull(),
  salesStartDate: datetime({ mode: 'string', fsp: 3 }).notNull(),
  salesEndDate: datetime({ mode: 'string', fsp: 3 }).notNull(),
  benefits: varchar({ length: 5000 }),
});

export const eventTickets = mysqlTable('EventTickets', {
  id: int().autoincrement().notNull().primaryKey(),
  ticketTypeId: int().references(() => ticketTypes.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ticketId: int().references(() => tickets.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ticketConfigurationId: int().references(() => ticketConfigurations.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
});

export const ticketOrders = mysqlTable('TicketOrders', {
  id: int().autoincrement().notNull().primaryKey(),
  userId: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  status: mysqlEnum('order_status', ['Pending', 'Completed']).notNull(),
  quantity: int().notNull(),
  createdAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
  updatedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
});

export const ticketOrderItems = mysqlTable('TicketOrderItems', {
  id: int().autoincrement().notNull().primaryKey(),
  orderId: int().references(() => ticketOrders.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  eventTicketId: int().references(() => eventTickets.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  ticketIdentifier: varchar({ length: 500 }).notNull(),
  qrCodeUrl: varchar({ length: 500 }).notNull(),
  checkedIn: boolean().default(false).notNull(),
  checkedInAt: datetime({ mode: 'string', fsp: 3 }),
  checkedInBy: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
});

export const ticketOrderUserDetails = mysqlTable('TicketOrderUserDetails', {
  id: int().autoincrement().notNull().primaryKey(),
  orderId: int().references(() => ticketOrders.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  phoneNumber: varchar({ length: 20 }).notNull(),
});
