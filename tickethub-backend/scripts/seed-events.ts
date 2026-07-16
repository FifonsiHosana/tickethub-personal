import { db } from '../src/db/client.js';

import {
  events,
  eventsVenues,
  eventImages,
  categorizedEvents,
} from '../src/db/schema/index.js';

import {
  tickets,
  ticketTypes,
  ticketConfigurations,
  eventTickets,
} from '../src/db/schema/index.js';

async function seedEvents() {
  console.log('🌱 Seeding events...');

  /**
   * Create venues
   */
  await db.insert(eventsVenues).values([
    {
      id: 1,
      venue_name: 'Accra International Conference Centre',
      address: 'Castle Road',
      city_or_town: 'Accra',
      country: 'Ghana',
      googleMapLink: 'https://maps.google.com',
    },

    {
      id: 2,
      venue_name: 'Kumasi City Mall',
      address: 'Harper Road',
      city_or_town: 'Kumasi',
      country: 'Ghana',
      googleMapLink: 'https://maps.google.com',
    },

    {
      id: 3,
      venue_name: 'Labadi Beach Hotel',
      address: 'La Road',
      city_or_town: 'Accra',
      country: 'Ghana',
      googleMapLink: 'https://maps.google.com',
    },
  ]);

  /**
   * Create events
   */
  const createdEvents = await db
    .insert(events)
    .values([
      {
        title: 'Accra Music Festival 2026',

        description: 'A night of Ghanaian music, culture and entertainment.',

        status: 'Published',

        eventVenueId: 1,

        organizerId: 2,

        dateAndTime: '2026-08-15 18:00:00',

        capacity: 5000,

        approvedBy: 1,

        approvedAt: '2026-07-15 10:00:00',

        approvalStatus: 'Approved',

        termsAndConditions: 'No refunds after purchase.',
      },

      {
        title: 'Tech Summit Ghana 2026',

        description: 'A gathering of developers, startups and innovators.',

        status: 'Published',

        eventVenueId: 2,

        organizerId: 2,

        dateAndTime: '2026-09-20 09:00:00',

        capacity: 1000,

        approvedBy: 1,

        approvedAt: '2026-07-15 10:00:00',

        approvalStatus: 'Approved',

        termsAndConditions: 'Registration required.',
      },

      {
        title: 'Ghana Business Expo 2026',

        description: 'Networking event for entrepreneurs and businesses.',

        status: 'Published',

        eventVenueId: 3,

        organizerId: 2,

        dateAndTime: '2026-10-10 10:00:00',

        capacity: 3000,

        approvedBy: 1,

        approvedAt: '2026-07-15 10:00:00',

        approvalStatus: 'Approved',

        termsAndConditions: 'Business attendees only.',
      },
    ])
    .$returningId();

  /**
   * Add event images
   */
  await db.insert(eventImages).values([
    {
      eventId: createdEvents[0].id,

      imageUrl: 'https://images.com/music-banner.jpg',

      type: 'Banner',
    },

    {
      eventId: createdEvents[1].id,

      imageUrl: 'https://images.com/tech-banner.jpg',

      type: 'Banner',
    },

    {
      eventId: createdEvents[2].id,

      imageUrl: 'https://images.com/business-banner.jpg',

      type: 'Banner',
    },
  ]);

  /**
   * Connect categories
   */
  await db.insert(categorizedEvents).values([
    {
      event_id: createdEvents[0].id,

      category_id: 1,
    },

    {
      event_id: createdEvents[1].id,

      category_id: 2,
    },

    {
      event_id: createdEvents[2].id,

      category_id: 3,
    },
  ]);

  /**
   * Ticket Types
   */
  const ticketTypeRows = await db
    .insert(ticketTypes)
    .values([
      {
        name: 'Early Bird',

        description: 'Discounted tickets available for early buyers.',
      },

      {
        name: 'Regular',

        description: 'Standard event admission ticket.',
      },
    ])
    .$returningId();

  /**
   * Create tickets + configurations
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

    const earlyConfig = await db
      .insert(ticketConfigurations)
      .values({
        price: '50.00',

        totalCount: 100,

        totalSold: 0,

        totalRemaining: 100,

        salesStartDate: '2026-07-15 00:00:00',

        salesEndDate: '2026-08-01 23:59:59',

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

        salesStartDate: '2026-07-15 00:00:00',

        salesEndDate: '2026-08-15 23:59:59',

        benefits: 'Standard admission.',
      })
      .$returningId();

    await db.insert(eventTickets).values([
      {
        ticketId: earlyBirdTicket[0].id,

        ticketTypeId: ticketTypeRows[0].id,

        ticketConfigurationId: earlyConfig[0].id,
      },

      {
        ticketId: regularTicket[0].id,

        ticketTypeId: ticketTypeRows[1].id,

        ticketConfigurationId: regularConfig[0].id,
      },
    ]);
  }

  console.log('✅ Events seeded successfully');
}

seedEvents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);

    process.exit(1);
  });
