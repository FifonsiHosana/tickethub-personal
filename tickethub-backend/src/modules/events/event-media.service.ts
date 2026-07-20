import { eventImages } from '@/db/schema/events.js';

import { db } from '@/db/client.js';

export async function createEventMedia(data: {
  eventId: number;

  imageUrl: string;

  type: 'Banner' | 'Gallery' | 'Sponsor';
}) {
  return await db.insert(eventImages).values({
    eventId: data.eventId,

    imageUrl: data.imageUrl,

    type: data.type,
  });
}
