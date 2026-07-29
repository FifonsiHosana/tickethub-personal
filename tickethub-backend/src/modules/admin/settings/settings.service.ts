import { db } from '@/db/client.js';
import { platformSettings } from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';
import { now } from '@/utils/timeDatehelpers.js';

export class SettingsService {
  async getAll() {
    return await db.select().from(platformSettings);
  }

  async update(updates: Record<string, string>, adminId: number) {
    const keys = Object.keys(updates);
    if (keys.length === 0) {
      throw new Error('No settings to update');
    }

    for (const key of keys) {
      const value = updates[key];
      if (value === undefined || value === null) continue;

      const [existing] = await db
        .select({ id: platformSettings.id })
        .from(platformSettings)
        .where(eq(platformSettings.key, key))
        .limit(1);

      if (existing) {
        await db
          .update(platformSettings)
          .set({ value, updatedAt: now(), updatedBy: adminId })
          .where(eq(platformSettings.id, existing.id));
      }
    }

    return this.getAll();
  }
}

export default new SettingsService();
