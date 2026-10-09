import { eq } from 'drizzle-orm';
import { events } from '@/db/schema/index.js';

export function toEventSlugBase(title: string): string {
  const slug = title
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  return slug || 'event';
}

export async function createUniqueEventSlug(
  dbLike: typeof import('@/db/client.js').db,
  title: string,
): Promise<string> {
  const base = toEventSlugBase(title);
  let candidate = base;
  let suffix = 2;

  while (await eventSlugExists(dbLike, candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function eventSlugExists(
  dbLike: typeof import('@/db/client.js').db,
  slug: string,
) {
  const [row] = await dbLike
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1);

  return Boolean(row);
}
