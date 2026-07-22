import { db } from '../src/db/client.js';

import {
  events,
  eventImages,
  categorizedEvents,
  tickets,
  ticketConfigurations,
  eventTickets,
} from '../src/db/schema/index.js';

import { ticketTypes } from '../src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function seedOrganizerEvents() {
  console.log('🌱 Seeding events for Organizer #3...');

  /**
   * Fetch existing ticket types
   */
  const ticketTypeRows = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.name, 'Early Bird'));

  const regularTicketTypeRows = await db
    .select()
    .from(ticketTypes)
    .where(eq(ticketTypes.name, 'Regular'));

  if (!ticketTypeRows.length || !regularTicketTypeRows.length) {
    throw new Error(
      'Ticket types not found. Please run the initial seed first.',
    );
  }

  const earlyBirdType = ticketTypeRows[0];
  const regularType = regularTicketTypeRows[0];

  /**
   * Create events
   */
  const createdEvents = await db
    .insert(events)
    .values([
      {
        title: 'Cape Coast Food & Culture Festival',

        description:
          'Celebrate Ghanaian cuisine, culture and live performances.',

        status: 'Published',

        organizerId: 3,

        eventVenueId: 1,

        dateAndTime: '2026-11-07 15:00:00',

        capacity: 2500,

        approvedBy: 1,

        approvedAt: '2026-07-15 10:00:00',

        approvalStatus: 'Approved',

        termsAndConditions: 'No outside food or drinks.',
      },

      {
        title: 'African Startup Connect 2026',

        description: 'Networking event for founders, investors and innovators.',

        status: 'Published',

        organizerId: 3,

        eventVenueId: 2,

        dateAndTime: '2026-11-28 09:00:00',

        capacity: 1200,

        approvedBy: 1,

        approvedAt: '2026-07-15 10:00:00',

        approvalStatus: 'Approved',

        termsAndConditions: 'Registration confirmation required.',
      },

      {
        title: 'December Beach Party',

        description:
          'An all-day beach experience featuring DJs, games and live performances.',

        status: 'Published',

        organizerId: 3,

        eventVenueId: 3,

        dateAndTime: '2026-12-26 14:00:00',

        capacity: 4000,

        approvedBy: 1,

        approvedAt: '2026-07-15 10:00:00',

        approvalStatus: 'Approved',

        termsAndConditions: '18+ event. Valid ID required.',
      },
    ])
    .$returningId();

  /**
   * Banner Images
   */
  await db.insert(eventImages).values([
    {
      eventId: createdEvents[0].id,

      imageUrl: 'https://images.com/food-festival-banner.jpg',

      type: 'Banner',
    },

    {
      eventId: createdEvents[1].id,

      imageUrl: 'https://images.com/startup-connect-banner.jpg',

      type: 'Banner',
    },

    {
      eventId: createdEvents[2].id,

      imageUrl: 'https://images.com/beach-party-banner.jpg',

      type: 'Banner',
    },
  ]);

  /**
   * Categories
   */
  await db.insert(categorizedEvents).values([
    {
      event_id: createdEvents[0].id,

      category_id: 4,
    },

    {
      event_id: createdEvents[1].id,

      category_id: 2,
    },

    {
      event_id: createdEvents[2].id,

      category_id: 1,
    },
  ]);

  /**
   * Create tickets and configurations
   */
  for (const event of createdEvents) {
    const earlyBirdTicket = await db
      .insert(tickets)
      .values({
        name: 'Early Bird',

        eventId: event.id,
      })
      .$returningId();

    const regularTicket = await db
      .insert(tickets)
      .values({
        name: 'Regular',

        eventId: event.id,
      })
      .$returningId();

    const earlyBirdConfig = await db
      .insert(ticketConfigurations)
      .values({
        price: '50.00',

        totalCount: 100,

        totalSold: 0,

        totalRemaining: 100,

        salesStartDate: '2026-09-01 00:00:00',

        salesEndDate: '2026-11-01 23:59:59',

        benefits: 'Discounted entry.',
      })
      .$returningId();

    const regularConfig = await db
      .insert(ticketConfigurations)
      .values({
        price: '100.00',

        totalCount: 500,

        totalSold: 0,

        totalRemaining: 500,

        salesStartDate: '2026-09-01 00:00:00',

        salesEndDate: '2026-12-26 23:59:59',

        benefits: 'Standard admission.',
      })
      .$returningId();

    await db.insert(eventTickets).values([
      {
        ticketId: earlyBirdTicket[0].id,

        ticketTypeId: earlyBirdType.id,

        ticketConfigurationId: earlyBirdConfig[0].id,
      },

      {
        ticketId: regularTicket[0].id,

        ticketTypeId: regularType.id,

        ticketConfigurationId: regularConfig[0].id,
      },
    ]);
  }

  console.log('✅ Organizer #3 events seeded successfully.');
}

seedOrganizerEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
