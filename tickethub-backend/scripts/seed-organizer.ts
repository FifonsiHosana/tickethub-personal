import 'dotenv/config';
import bcrypt from 'bcrypt';

import { db } from '../src/db/client.js';
import { users, userRoles } from '../src/db/schema/auth.js';

async function seedOrganizer() {
  console.log('🌱 Seeding organizer...');

  const organizerPassword = await bcrypt.hash('Organizer@123', 10);

  const [organizer] = await db
    .insert(users)
    .values({
      firstName: 'Sarah',
      lastName: 'Mensah',
      email: 'sarah.organizer@example.com',
      phoneNumber: '233500000003',
      passwordHash: organizerPassword,
      isVerified: true,
      isActive: true,
      lastLogin: new Date().toISOString().slice(0, 19).replace('T', ' '),
    })
    .$returningId();

  await db.insert(userRoles).values({
    userId: organizer.id,
    roleId: 2, // Organizer
  });

  console.log(`✅ Organizer created successfully. User ID: ${organizer.id}`);
}

seedOrganizer()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
