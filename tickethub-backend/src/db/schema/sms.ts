import {
  mysqlTable,
  varchar,
  datetime,
  int,
  decimal,
  mysqlEnum,
  text,
  boolean,
  timestamp,
  serial,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { users } from './auth.js';
import { events } from './events.js';

export const smsHistory = mysqlTable('SmsHistory', {
  id: int().autoincrement().notNull().primaryKey(),
  userId: int()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull(),
  message: text().notNull(),
  recipients: text().notNull(), // JSON stringified array of phone numbers
  sender: varchar({ length: 11 }),
  status: mysqlEnum('sms_status', ['sent', 'scheduled', 'draft', 'failed'])
    .notNull()
    .default('sent'),
  scheduledAt: datetime({ mode: 'string', fsp: 3 }),
  sentAt: datetime({ mode: 'string', fsp: 3 }),
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

export const creditWallet = mysqlTable('CreditWallet', {
  id: int().autoincrement().notNull().primaryKey(),
  userId: int()
    .references(() => users.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    })
    .notNull()
    .unique(),
  totalCredit: decimal({
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0.00'),
  creditUsed: decimal({
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0.00'),
  creditLeft: decimal({
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0.00'),
  // currency: varchar({ length: 3 }).notNull().default('USD'),
  isActive: boolean().default(true).notNull(),
  createdAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
  updatedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
});

export const creditTransactions = mysqlTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: int('user_id').notNull(),
  reference: varchar('reference', { length: 255 }).notNull().unique(),
  credits: decimal('credits', { precision: 12, scale: 2 }).notNull(),
  type: varchar('type', { length: 50 }).notNull().default('purchase'),
  createdAt: varchar('created_at', { length: 50 }),
});
