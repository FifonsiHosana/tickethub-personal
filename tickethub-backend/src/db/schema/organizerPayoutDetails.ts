import {
  mysqlTable,
  varchar,
  datetime,
  int,
  uniqueIndex,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { users } from './auth.js';
import { sql } from 'drizzle-orm';

export const organizerPayoutDetails = mysqlTable(
  'OrganizerPayoutDetails',
  {
    id: int().autoincrement().primaryKey(),
    organizerId: int()
      .references(() => users.id, {
        onDelete: 'cascade',
        onUpdate: 'cascade',
      })
      .notNull(),

    bankName: varchar({ length: 255 }),
    accountNumber: varchar({ length: 50 }),
    accountName: varchar({ length: 255 }),

    mobileMoneyProvider: varchar({ length: 50 }),
    mobileMoneyNumber: varchar({ length: 20 }),
    mobileMoneyName: varchar({ length: 255 }),

    recipientCode: varchar({ length: 255 }),

    payoutMethod: mysqlEnum(['bank', 'mobile_money'])
      .default('bank')
      .notNull(),

    createdAt: datetime({ mode: 'string', fsp: 3 })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: datetime({ mode: 'string', fsp: 3 })
      .default(sql`(now())`)
      .notNull(),
  },
  (table) => [
    uniqueIndex('organizer_payout_unique').on(table.organizerId),
  ],
);
