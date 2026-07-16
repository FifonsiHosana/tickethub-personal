import {
  mysqlTable,
  varchar,
  decimal,
  datetime,
  mysqlEnum,
  int,
} from 'drizzle-orm/mysql-core';
import { ticketOrders } from './tickets.js';
import { users } from './auth.js';
import { sql } from 'drizzle-orm';

export const payments = mysqlTable('Payments', {
  id: int().autoincrement().primaryKey(),
  orderId: int()
    .references(() => ticketOrders.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    })
    .notNull(),
  provider: mysqlEnum('provider', ['hubtel', 'paystack']).notNull(),
  amount: decimal({
    precision: 10,
    scale: 2,
  }).notNull(),
  reference: varchar({
    length: 255,
  }).notNull(),
  currency: varchar({
    length: 3,
  }).notNull(),

  status: mysqlEnum('status', ['Completed', 'Failed']).notNull(),

  paidAt: datetime({ mode: 'string', fsp: 3 }),
});

export const payouts = mysqlTable('Payouts', {
  id: int().autoincrement().primaryKey(),
  organizerId: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  amount: decimal({
    precision: 10,
    scale: 2,
  }).notNull(),
  commission: decimal({
    precision: 10,
    scale: 2,
  }).notNull(),
  processingFee: decimal({
    precision: 10,
    scale: 2,
  }).notNull(),
  reference: varchar({
    length: 255,
  }).notNull(),
  status: mysqlEnum('status', ['Completed', 'Failed']).notNull(),
  paidAt: datetime({ mode: 'string', fsp: 3 }),
});

export const refunds = mysqlTable('Refunds', {
  id: int().autoincrement().primaryKey(),
  paymentId: int().references(() => payments.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  amount: decimal({
    precision: 10,
    scale: 2,
  }).notNull(),
  reason: varchar({
    length: 255,
  }).notNull(),
  status: mysqlEnum('status', ['Completed', 'Failed']).notNull(),
  requestedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
  approvedAt: datetime({ mode: 'string', fsp: 3 }),
  approvedBy: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
});
