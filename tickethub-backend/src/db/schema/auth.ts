import {
  mysqlTable,
  varchar,
  boolean,
  datetime,
  int,
  index,
  uniqueIndex,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const users = mysqlTable('Users', {
  id: int().autoincrement().notNull().primaryKey(),
  firstName: varchar({ length: 255 }).notNull(),
  lastName: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  phoneNumber: varchar({ length: 20 }).unique(),
  passwordHash: varchar({ length: 255 }),
  isVerified: boolean().default(false).notNull(),
  isActive: boolean().default(true),
  profileImage: varchar({ length: 1000 }),
  lastLogin: datetime({ mode: 'string', fsp: 3 }),
  createdAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
  updatedAt: datetime({ mode: 'string', fsp: 3 })
    .default(sql`(now())`)
    .notNull(),
});

export const roles = mysqlTable('Roles', {
  id: int().autoincrement().notNull().primaryKey(),
  name: varchar({ length: 255 }).notNull().unique(),
});

export const userRoles = mysqlTable(
  'UserRoles',
  {
    id: int().autoincrement().notNull().primaryKey(),
    userId: int().references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    roleId: int().references(() => roles.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => [
    index('User_id_idx').on(table.userId),
    uniqueIndex('user_role_unique').on(table.userId, table.roleId),
  ],
);

export const permissions = mysqlTable('Permissions', {
  id: int().autoincrement().notNull().primaryKey(),
  resource: varchar({ length: 255 }).notNull(),
  action: varchar({ length: 255 }).notNull(),
  resource_action: varchar({ length: 255 }).notNull().unique(),
});

export const rolePermissions = mysqlTable(
  'RolePermissions',
  {
    id: int().autoincrement().notNull().primaryKey(),
    roleId: int().references(() => roles.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    permissionId: int().references(() => permissions.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
  },
  (table) => [
    uniqueIndex('role_permission_unique').on(table.roleId, table.permissionId),
  ],
);

export const otpVerifications = mysqlTable(
  'OtpVerifications',
  {
    id: int().autoincrement().primaryKey(),
    userId: int().references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    email: varchar({ length: 255 }).notNull(),
    otpHash: varchar({ length: 500 }).notNull(),
    purpose: mysqlEnum('purpose', [
      'EMAIL_VERIFICATION',
      'PASSWORD_RESET',
      'EMAIL_CHANGE',
      'LOGIN_VERIFICATION',
      'ORGANIZER_APPROVAL',
    ]).notNull(),
    isUsed: boolean().default(false).notNull(),
    expiresAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
    createdAt: datetime({ mode: 'string', fsp: 3 })
      .default(sql`(now())`)
      .notNull(),
    updatedAt: datetime({ mode: 'string', fsp: 3 })
      .default(sql`(now())`)
      .notNull(),
  },
  (table) => [
    index('otp_email_idx').on(table.email),
    index('otp_user_idx').on(table.userId),
  ],
);
