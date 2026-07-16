import {
  mysqlTable,
  varchar,
  datetime,
  int,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './auth.js';

export const eventsVenues = mysqlTable('EventsVenues', {
  id: int('id').notNull().primaryKey(),
  venue_name: varchar({ length: 255 }).notNull(),
  address: varchar({ length: 255 }),
  city_or_town: varchar({ length: 255 }).notNull(),
  country: varchar({ length: 255 }).notNull(),
  googleMapLink: varchar({ length: 500 }),
});

export const events = mysqlTable('Events', {
  id: int().autoincrement().notNull().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 5000 }),

  status: mysqlEnum('event_status', [
    'Draft',
    'Published',
    'Completed',
    'Cancelled',
  ]).notNull(),

  eventVenueId: int().references(() => eventsVenues.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  organizerId: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),

  dateAndTime: datetime({ mode: 'string', fsp: 3 }).notNull(),

  capacity: int().notNull(),
  approvedBy: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  approvedAt: datetime({ mode: 'string', fsp: 3 }),
  approvalStatus: mysqlEnum('approval_status', [
    'Pending',
    'Approved',
    'Rejected',
  ]),
  termsAndConditions: varchar({ length: 5000 }),
  createdAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),

  updatedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
});

export const eventImages = mysqlTable('EventMedia', {
  id: int().autoincrement().notNull().primaryKey(),
  eventId: int().references(() => events.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  imageUrl: varchar({ length: 500 }).notNull(),
  type: mysqlEnum('media_type', ['Banner', 'Gallery', 'Sponsor']).notNull(),
});

export const category = mysqlTable('Categories', {
  id: int().autoincrement().notNull().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
});

export const categorizedEvents = mysqlTable('CategorizedEvents', {
  id: int().autoincrement().notNull().primaryKey(),
  event_id: int().references(() => events.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  category_id: int().references(() => category.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
});

export const eventStaff = mysqlTable('EventStaff', {
  id: int().autoincrement().notNull().primaryKey(),
  event_id: int().references(() => events.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  staff_id: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  assigned_by: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  assigned_at: datetime({ mode: 'string', fsp: 3 }).notNull(),
});
