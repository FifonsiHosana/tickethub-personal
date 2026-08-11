import { db } from '@/db/client.js';
import { platformSettings } from '@/db/schema/index.js';
import { eq } from 'drizzle-orm';
import {
  PROCESSING_FEE_PERCENTAGE_KEY,
  DEFAULT_PROCESSING_FEE_PERCENTAGE,
} from '@/modules/finance/finance.pricing.js';

export class SettingsService {
  async getPublic() {
    const [row] = await db
      .select({ value: platformSettings.value })
      .from(platformSettings)
      .where(eq(platformSettings.key, PROCESSING_FEE_PERCENTAGE_KEY))
      .limit(1);

    const value = row ? Number(row.value) : DEFAULT_PROCESSING_FEE_PERCENTAGE;

    return {
      processing_fee_percentage: Number.isFinite(value)
        ? value
        : DEFAULT_PROCESSING_FEE_PERCENTAGE,
    };
  }
}

export default new SettingsService();