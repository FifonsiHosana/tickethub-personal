import 'dotenv/config';
import bcrypt from 'bcrypt';

import { db } from '../src/db/client';
import { users, roles, userRoles } from '../src/db/schema/auth';

async function seed() {
  console.log('🌱 Seeding authentication data...');

  // --------------------------------
  // Roles
  // --------------------------------

  const [adminRole] = await db
    .insert(roles)
    .values({
      name: 'Admin',
    })
    .$returningId();

  const [organizerRole] = await db
    .insert(roles)
    .values({
      name: 'Organizer',
    })
    .$returningId();

  // --------------------------------
  // Passwords
  // --------------------------------

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const organizerPassword = await bcrypt.hash('Organizer@123', 10);

  // --------------------------------
  // Users
  // --------------------------------

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

  // --------------------------------
  // Assign Roles
  // --------------------------------

  await db.insert(userRoles).values([
    {
      userId: admin.id,
      roleId: adminRole.id,
    },
    {
      userId: organizer.id,
      roleId: organizerRole.id,
    },
  ]);

  console.log('✅ Authentication seed completed.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Authentication seed failed:', err);
    process.exit(1);
  });
