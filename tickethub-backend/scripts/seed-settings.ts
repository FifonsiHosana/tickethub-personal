import 'dotenv/config';
import { db } from '../src/db/client';
import { platformSettings } from '../src/db/schema/settings';
import { eq } from 'drizzle-orm';

const settings = [
  { key: 'payment_provider',    value: 'paystack',  description: 'Active payment gateway (paystack | hubtel)' },
  { key: 'commission_rate',     value: '5.00',      description: 'Platform commission percentage per sale' },
  { key: 'processing_fee',      value: '1.50',      description: 'Flat processing fee charged per transaction in GHS' },
  { key: 'processing_fee_percentage', value: '2.00', description: 'Processing fee as a percentage of the ticket subtotal' },
  { key: 'currency',            value: 'GHS',       description: 'Default currency for all transactions' },
  { key: 'auto_approve_events', value: 'false',     description: 'Auto-publish events without admin review' },
  { key: 'min_payout_amount',   value: '50.00',     description: 'Minimum balance required to request a payout' },
  { key: 'support_email',       value: 'support@tickethubgh.com', description: 'Customer support email address' },
  { key: 'platform_name',       value: 'TicketHub',  description: 'Platform display name' },
];

function now() {
  return new Date().toISOString().replace('T', ' ').replace('Z', '');
}

async function seed() {
  console.log('🌱 Seeding platform settings...\n');

  let inserted = 0;
  let updated = 0;

  for (const setting of settings) {
    const [existing] = await db
      .select({ id: platformSettings.id })
      .from(platformSettings)
      .where(eq(platformSettings.key, setting.key))
      .limit(1);

    if (existing) {
      await db
        .update(platformSettings)
        .set({ value: setting.value, description: setting.description, updatedAt: now() })
        .where(eq(platformSettings.id, existing.id));
      updated++;
    } else {
      await db.insert(platformSettings).values({ ...setting, updatedAt: now() });
      inserted++;
    }

    console.log(`  ${existing ? '↻' : '+'} ${setting.key.padEnd(22)} → ${setting.value}`);
  }

  console.log(`\n✅ Done — ${inserted} inserted, ${updated} updated.`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
