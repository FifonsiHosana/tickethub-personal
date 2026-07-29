import { z } from 'zod';

const eventMediaSchema = z.object({
  imageUrl: z.url(),

  type: z.enum(['Banner', 'Gallery', 'Sponsor']),
});

export const createOrganizerEventSchema = z.object({
  title: z.string().min(3, 'Event title must contain at least 3 characters'),
  description: z.string().max(5000).optional(),
  eventVenueId: z.number().int().positive().optional(),

  media: z.array(eventMediaSchema).optional(),
  dateAndTime: z.iso.datetime(),
  capacity: z.number().int().positive(),
  termsAndConditions: z.string().max(5000).optional(),
});

export const updateOrganizerEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().max(5000).optional(),
  eventVenueId: z.number().int().positive().optional(),
  media: z.array(eventMediaSchema).optional(),
  dateAndTime: z.iso.datetime().optional(),
  capacity: z.number().int().positive().optional(),
  termsAndConditions: z.string().max(5000).optional(),
});

export const organizerEventsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => Number(value ?? 1)),
  pageSize: z
    .string()
    .optional()
    .transform((value) => Number(value ?? 10)),
  search: z.string().optional(),
  status: z.enum(['Draft', 'Published', 'Completed', 'Cancelled']).optional(),
});

export const createEventWithTicketsSchema = z.object({
  title: z.string().min(3, 'Event title must contain at least 3 characters'),
  description: z.string().max(5000).optional(),
  eventVenueId: z.number().int().positive(),
  media: z
    .array(
      z.object({
        imageUrl: z.url(),
        type: z.enum(['Banner', 'Gallery', 'Sponsor']),
      }),
    )
    .optional(),
  dateAndTime: z.iso.datetime(),
  capacity: z.number().int().positive(),
  termsAndConditions: z.string().max(5000).optional(),
  tickets: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(3, 'Ticket name must be at least 3 characters'),
        ticketTypeId: z.number().int().positive().optional(),
        ticketTypeName: z.string().trim().min(2).optional(),
        ticketTypeDescription: z.string().max(255).optional(),
        price: z.number().positive(),
        totalCount: z.number().int().positive().optional(),
        salesStartDate: z.iso.datetime().optional(),
        salesEndDate: z.iso.datetime().optional(),
        benefits: z.string().max(5000).optional(),
      }),
    )
    .min(1, 'At least one ticket is required'),
});

export type CreateOrganizerEventType = z.infer<
  typeof createOrganizerEventSchema
>;
export type UpdateOrganizerEventType = z.infer<
  typeof updateOrganizerEventSchema
>;
export type OrganizerEventsQueryType = z.infer<
  typeof organizerEventsQuerySchema
>;
export type CreateEventWithTicketsType = z.infer<
  typeof createEventWithTicketsSchema
>;

export const createVenueSchema = z.object({
  venue_name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  city_or_town: z.string().min(1, 'City/Town is required'),
  country: z.string().min(1, 'Country is required'),
  googleMapLink: z.string().optional(),
});

export const assignStaffSchema = z.object({
  staffUserIds: z.array(z.number().int().positive()).min(1, 'At least one staff member is required'),
});

export type CreateVenueType = z.infer<typeof createVenueSchema>;
export type AssignStaffType = z.infer<typeof assignStaffSchema>;
