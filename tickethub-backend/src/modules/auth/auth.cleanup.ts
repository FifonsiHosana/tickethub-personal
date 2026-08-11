import { and, lt, inArray, eq, isNotNull } from 'drizzle-orm';

import { db } from '@/db/client.js';
import { users, userRoles, otpVerifications, eventStaff } from '@/db/schema/index.js';
import logger from '@/utils/logger/index.js';
import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';

const UNVERIFIED_USER_TTL_HOURS = 24;

const UNVERIFIED_USER_TTL_MS = UNVERIFIED_USER_TTL_HOURS * 60 * 60 * 1000;

/**
 * Hard-delete stale unverified accounts (and their dependent rows).
 *
 * Registered-but-never-verified users permanently block re-registration of
 * their email. After the TTL window they are removed so the email becomes
 * usable again. Dependent rows (OTPs, roles, staff assignments) are deleted
 * explicitly because their FKs are `onDelete: 'set null'`, which would
 * otherwise leave orphan rows behind.
 */
export async function cleanupUnverifiedUsers(): Promise<number> {
  const cutoff = formatDateForMySQL(new Date(Date.now() - UNVERIFIED_USER_TTL_MS))

  const staleUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.isVerified, false),
        isNotNull(users.passwordHash),
        lt(users.createdAt, cutoff),
      ),
    );

  const ids = staleUsers.map((user) => user.id);

  if (ids.length === 0) {
    return 0;
  }

  let deleted = ids.length;

  await db.transaction(async (tx) => {
    await tx
      .delete(otpVerifications)
      .where(inArray(otpVerifications.userId, ids));
    await tx.delete(userRoles).where(inArray(userRoles.userId, ids));
    await tx.delete(eventStaff).where(inArray(eventStaff.staff_id, ids));

    await tx.delete(users).where(inArray(users.id, ids));
  });

  logger.info(
    { deleted, cutoff },
    'Cleaned up stale unverified accounts',
  );

  return deleted;
}

/**
 * Scheduled job — runs every 6 hours, unref'd so it never blocks shutdown.
 */
export function startCleanupJob(intervalMs = 6 * 60 * 60 * 1000) {
  const timer = setInterval(() => {
    cleanupUnverifiedUsers().catch((err) => {
      logger.error(
        { err },
        'Unverified-account cleanup job failed',
      );
    });
  }, intervalMs);

  timer.unref();

  logger.info('Started unverified-account cleanup job (every 6h)');
}
