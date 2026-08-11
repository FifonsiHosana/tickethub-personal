import { db } from '@/db/client.js';
import { eq } from 'drizzle-orm';
import { users } from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { generateAccessToken } from '../auth.utils.js';
import {
  grantRoleIfMissing,
  getUserRoleNames,
} from './auth.registration.service.js';

/**
 * Self-service role upgrades for existing accounts. "Anyone can create an
 * event" — an authenticated attendee is upgraded to organizer (idempotently)
 * and handed a fresh token carrying both roles.
 */
export class RoleUpgradeService {
  async becomeOrganizer(userId: number) {
    await grantRoleIfMissing(db, userId, 'organizer');

    const [user] = await db
      .select({
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    const rolesList = await getUserRoleNames(userId);

    const token = generateAccessToken({
      id: userId,
      roles: rolesList,
    });

    return {
      token,
      user,
      roles: rolesList,
    };
  }
}