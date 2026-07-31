import { db } from '@/db/client.js';
import { users, roles, userRoles } from '@/db/schema/index.js';
import { and, eq, like, count, or } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { hashPassword } from '@/modules/auth/auth.utils.js';
import { now } from '@/utils/timeDatehelpers.js';
import type { ListUsersQueryType } from './users.schema.js';

const userWithRole = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  phoneNumber: users.phoneNumber,
  isVerified: users.isVerified,
  isActive: users.isActive,
  createdAt: users.createdAt,
};

async function requireUser(userId: number) {
  const [u] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!u) throw new AppError(404, 'User not found');
  return u;
}

async function getOrganizerRoleId() {
  const [r] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.name, 'organizer'))
    .limit(1);
  return r?.id;
}

export class UsersService {
  async list(params: ListUsersQueryType) {
    const { page, pageSize, search, role, isActive, isVerified } = params;
    const offset = (page - 1) * pageSize;
    const filters: any[] = [];
    if (search)
      filters.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`),
        ),
      );
    if (isActive !== undefined)
      filters.push(eq(users.isActive, isActive === 'true'));
    if (isVerified !== undefined)
      filters.push(eq(users.isVerified, isVerified === 'true'));
    const whereClause = filters.length > 0 ? and(...filters) : undefined;
    let query = db
      .select({
        ...userWithRole,
        lastLogin: users.lastLogin,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .$dynamic();
    if (role) query = query.where(eq(roles.name, role));
    else if (whereClause) query = query.where(whereClause);
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(role ? eq(roles.name, role) : (whereClause ?? undefined));
    const data = await query
      .orderBy(users.createdAt)
      .limit(pageSize)
      .offset(offset);
    return {
      data,
      pagination: {
        page,
        pageSize,
        total: Number(totalResult?.count ?? 0),
        totalPages: Math.ceil(Number(totalResult?.count ?? 0) / pageSize),
      },
    };
  }

  async getById(userId: number) {
    const [user] = await db
      .select({
        ...userWithRole,
        profileImage: users.profileImage,
        lastLogin: users.lastLogin,
        updatedAt: users.updatedAt,
        roleName: roles.name,
      })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  async suspend(userId: number, isActive: boolean) {
    await requireUser(userId);
    await db
      .update(users)
      .set({ isActive, updatedAt: now() })
      .where(eq(users.id, userId));
    return { message: isActive ? 'User reactivated' : 'User suspended' };
  }

  async verifyOrganizer(userId: number) {
    const [userRole] = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId))
      .limit(1);
    if (!userRole || userRole.roleName !== 'organizer')
      throw new AppError(400, 'User is not an organizer');
    await db
      .update(users)
      .set({ isVerified: true, updatedAt: now() })
      .where(eq(users.id, userId));
    return { message: 'Organizer verified successfully' };
  }

  async resetPassword(userId: number, newPassword: string) {
    await requireUser(userId);
    const passwordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: now() })
      .where(eq(users.id, userId));
    return { message: 'Password reset successfully' };
  }

  async listOrganizers() {
    const roleId = await getOrganizerRoleId();
    if (!roleId) return { data: [] };
    const data = await db
      .select(userWithRole)
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .where(and(eq(userRoles.roleId, roleId), eq(users.isActive, true)))
      .orderBy(users.createdAt);
    return { data };
  }

  async verificationQueue(params: ListUsersQueryType) {
    const { page, pageSize, search } = params;
    const roleId = await getOrganizerRoleId();
    if (!roleId) return { data: [], pagination: { page, pageSize, total: 0, totalPages: 0 } };
    const offset = (page - 1) * pageSize;
    const filters: any[] = [
      eq(userRoles.roleId, roleId),
      eq(users.isActive, true),
      eq(users.isVerified, false),
    ];
    if (search)
      filters.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`),
        ),
      );
    const [totalResult] = await db
      .select({ count: count() })
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .where(and(...filters));
    const data = await db
      .select(userWithRole)
      .from(users)
      .innerJoin(userRoles, eq(userRoles.userId, users.id))
      .where(and(...filters))
      .orderBy(users.createdAt)
      .limit(pageSize)
      .offset(offset);
    return {
      data,
      pagination: {
        page,
        pageSize,
        total: Number(totalResult?.count ?? 0),
        totalPages: Math.ceil(Number(totalResult?.count ?? 0) / pageSize),
      },
    };
  }
}

export default new UsersService();
