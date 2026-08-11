import 'dotenv/config';
import { db } from '../src/db/client';
import { payments } from '../src/db/schema';
import { and, eq } from 'drizzle-orm';

const PROCESSING_FEE_PERCENTAGE = 2;

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Reconstructs the subtotal/fee split from the charged amount.
 *
 * Live pricing charges amount = subtotal + (subtotal * pct / 100), so the
 * inverse is: subtotal = amount / (1 + pct/100), fee = amount - subtotal.
 */
function calculateBreakdown(amount: number) {
  const subtotal = round2(amount / (1 + PROCESSING_FEE_PERCENTAGE / 100));
  const feeAmount = round2(amount - subtotal);

  return { subtotal, feeAmount };
}

async function backfill() {
  console.log('🔧 Backfilling payments subtotal/feeAmount...\n');

  const rows = await db
    .select({ id: payments.id, amount: payments.amount })
    .from(payments)
    .where(and(eq(payments.subtotal, '0'), eq(payments.feeAmount, '0')));

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const amount = Number(row.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      skipped++;
      console.log(`  ⏭ payment #${row.id} — non-positive amount, skipped`);
      continue;
    }

    const { subtotal, feeAmount } = calculateBreakdown(amount);

    await db
      .update(payments)
      .set({
        subtotal: subtotal.toString(),
        feeAmount: feeAmount.toString(),
      })
      .where(eq(payments.id, row.id));

    updated++;
    console.log(
      `  ✓ payment #${row.id} — amount ${amount.toFixed(2)} → subtotal ${subtotal.toFixed(2)} + fee ${feeAmount.toFixed(2)}`,
    );
  }

  console.log(`\n✅ Done — ${updated} updated, ${skipped} skipped (${rows.length - updated - skipped} total processed).`);
}

backfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });