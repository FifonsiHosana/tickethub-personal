import 'dotenv/config';
import bcrypt from 'bcrypt';

import { db } from '../src/db/client'; // adjust path
import {
  users,
  permissions,
  userRoles,
  rolePermissions,
} from '../src/db/schema/auth'; 

async function seed() {
  console.log('🌱 Seeding authentication data...');

  //
  // Permissions
  //
  const permissionList = [
    {
      resource: 'events',
      action: 'create',
      resource_action: 'events:create',
    },
    {
      resource: 'events',
      action: 'update',
      resource_action: 'events:update',
    },
    {
      resource: 'events',
      action: 'delete',
      resource_action: 'events:delete',
    },
    {
      resource: 'tickets',
      action: 'manage',
      resource_action: 'tickets:manage',
    },
    {
      resource: 'users',
      action: 'manage',
      resource_action: 'users:manage',
    },
  ];

  const permissionIds = await db
    .insert(permissions)
    .values(permissionList)
    .$returningId();

  //
  // Give Admin every permission
  //
  await db.insert(rolePermissions).values(
    permissionIds.map((permission) => ({
      roleId: 1,
      permissionId: permission.id,
    })),
  );

  //
  // Organizer permissions
  //
  await db.insert(rolePermissions).values([
    {
      roleId: 2,
      permissionId: permissionIds[0].id,
    },
    {
      roleId: 2,
      permissionId: permissionIds[1].id,
    },
    {
      roleId: 2,
      permissionId: permissionIds[3].id,
    },
  ]);

  //
  // Passwords
  //
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const organizerPassword = await bcrypt.hash('Organizer@123', 10);

  //
  // Users
  //
  const [admin] = await db
    .insert(users)
    .values({
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@example.com',
      phoneNumber: '233500000001',
      passwordHash: adminPassword,
      isVerified: true,
      isActive: true,
      lastLogin: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    .$returningId();

  const [organizer] = await db
    .insert(users)
    .values({
      firstName: 'Event',
      lastName: 'Organizer',
      email: 'organizer@example.com',
      phoneNumber: '233500000002',
      passwordHash: organizerPassword,
      isVerified: true,
      isActive: true,
      lastLogin: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    .$returningId();

  //
  // Assign roles
  //
  await db.insert(userRoles).values([
    {
      userId: admin.id,
      roleId: 1,
    },
    {
      userId: organizer.id,
      roleId: 2,
    },
  ]);

  console.log('✅ Authentication seed completed.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
