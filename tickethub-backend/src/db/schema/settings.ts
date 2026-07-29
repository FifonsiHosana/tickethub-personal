import {
  mysqlTable,
  varchar,
  datetime,
  int,
} from 'drizzle-orm/mysql-core';
import { users } from './auth.js';
import { sql } from 'drizzle-orm';

export const platformSettings = mysqlTable('PlatformSettings', {
  id: int().autoincrement().primaryKey(),
  key: varchar({ length: 191 }).notNull().unique(),
  value: varchar({ length: 1000 }).notNull(),
  description: varchar({ length: 500 }),
  updatedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
  updatedBy: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
});
