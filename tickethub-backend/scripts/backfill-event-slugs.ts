import { asc, eq, isNull } from 'drizzle-orm';
import { db } from '../src/db/client.js';
import { events } from '../src/db/schema/index.js';
import { createUniqueEventSlug } from '../src/modules/events/event-slug.service.js';

async function backfillEventSlugs() {
  const rows = await db
    .select({ id: events.id, title: events.title })
    .from(events)
    .where(isNull(events.slug))
    .orderBy(asc(events.id));

  if (rows.length === 0) {
    console.log('No missing event slugs found.');
    return;
  }

  for (const event of rows) {
    const slug = await createUniqueEventSlug(db, event.title);
    await db.update(events).set({ slug }).where(eq(events.id, event.id));
    console.log(`Backfilled event ${event.id}: ${slug}`);
  }

  console.log(`Backfilled ${rows.length} event slug(s).`);
}

backfillEventSlugs()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Failed to backfill event slugs:', error);
    process.exit(1);
  });
