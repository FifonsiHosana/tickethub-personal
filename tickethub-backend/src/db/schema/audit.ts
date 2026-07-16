import { mysqlTable, varchar, datetime, int } from 'drizzle-orm/mysql-core';
import { users } from './auth.js';
import { sql } from 'drizzle-orm';

export const auditLogs = mysqlTable('AuditLogs', {
  id: int().autoincrement().primaryKey(),

  userId: int().references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),

  action: varchar({
    length: 255,
  }).notNull(),

  resource: varchar({
    length: 255,
  }).notNull(),

  resourceId: varchar({
    length: 191,
  }).notNull(),

  createdAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
});
