import { z } from 'zod';
import { isGoogleMapLink } from '@/utils/googleMapLink.js';

const eventDateTimeSchema = z.union([
  z.iso.datetime(),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?$/),
]);

const eventMediaSchema = z.object({
  imageUrl: z.url(),

  type: z.enum(['Banner', 'Gallery', 'Sponsor']),
});

export const createOrganizerEventSchema = z.object({
  title: z.string().min(3, 'Event title must contain at least 3 characters'),
  description: z.string().max(5000).optional(),
  eventVenueId: z.number().int().positive().optional(),

  media: z.array(eventMediaSchema).optional(),
  dateAndTime: eventDateTimeSchema,
  dateAndTimeEnd: eventDateTimeSchema.optional(),
  capacity: z.number().int().positive(),
  termsAndConditions: z.string().max(5000).optional(),
});

export const updateOrganizerEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().max(5000).optional(),
  eventVenueId: z.number().int().positive().optional(),
  venue: z
    .object({
      venue_name: z.string().trim().min(1, 'Venue name is required'),
      address: z.string().nullable().optional(),
      city_or_town: z.string().trim().min(1, 'City/Town is required'),
      country: z.string().trim().min(1, 'Country is required'),
      googleMapLink: z.string().refine(isGoogleMapLink, 'Enter a valid Google Maps link').nullable().optional(),
    })
    .optional(),
  media: z.array(eventMediaSchema).optional(),
  dateAndTime: eventDateTimeSchema.optional(),
  dateAndTimeEnd: eventDateTimeSchema.nullable().optional(),
  capacity: z.number().int().positive().optional(),
  categoryIds: z.array(z.number().int().positive()).optional(),
  termsAndConditions: z.string().max(5000).nullable().optional(),
  tickets: z
    .object({
      upsert: z
        .array(
          z.object({
            id: z.number().int().positive().optional(),
            ticketTypeName: z.string().trim().min(2),
            price: z.number().positive(),
            totalCount: z.number().int().positive().optional(),
            salesStartDate: eventDateTimeSchema.optional(),
            salesEndDate: eventDateTimeSchema.optional(),
            benefits: z.string().max(5000).optional(),
            isVisible: z.boolean().optional(),
          }),
        )
        .optional(),
      deleteIds: z.array(z.number().int().positive()).optional(),
    })
    .optional(),
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

export const createEventWithTicketsSchema = z
  .object({
    title: z.string().min(3, 'Event title must contain at least 3 characters'),
    description: z.string().max(5000).optional(),
    eventVenueId: z.number().int().positive().optional(),
    venue: z
      .object({
        venue_name: z.string().trim().min(1, 'Venue name is required'),
        address: z.string().optional(),
        city_or_town: z.string().trim().min(1, 'City/Town is required'),
        country: z.string().trim().min(1, 'Country is required'),
        googleMapLink: z.string().refine(isGoogleMapLink, 'Enter a valid Google Maps link').optional(),
      })
      .optional(),
    media: z
      .array(
        z.object({
          imageUrl: z.url(),
          type: z.enum(['Banner', 'Gallery', 'Sponsor']),
        }),
      )
      .optional(),
    dateAndTime: eventDateTimeSchema,
    dateAndTimeEnd: eventDateTimeSchema.optional(),
    capacity: z.number().int().positive(),
    termsAndConditions: z.string().max(5000).optional(),
    categoryIds: z.array(z.number().int().positive()).optional(),
    tickets: z
      .array(
        z.object({
          ticketTypeId: z.number().int().positive().optional(),
          ticketTypeName: z.string().trim().min(2).optional(),
          price: z.number().positive(),
          totalCount: z.number().int().positive().optional(),
          salesStartDate: eventDateTimeSchema.optional(),
          salesEndDate: eventDateTimeSchema.optional(),
          benefits: z.string().max(5000).optional(),
          isVisible: z.boolean().optional(),
        }),
      )
      .min(1, 'At least one ticket is required'),
  })
  .refine((data) => data.eventVenueId !== undefined || data.venue !== undefined, {
    message: 'Either eventVenueId or venue is required',
    path: ['eventVenueId'],
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
  googleMapLink: z.string().refine(isGoogleMapLink, 'Enter a valid Google Maps link').optional(),
});

export const assignStaffSchema = z.object({
  staffUserIds: z.array(z.number().int().positive()).min(1, 'At least one staff member is required'),
});

export const listOrganizerStaffQuerySchema = z.object({
  search: z.string().optional(),
});

export type CreateVenueType = z.infer<typeof createVenueSchema>;
export type AssignStaffType = z.infer<typeof assignStaffSchema>;
export type ListOrganizerStaffQueryType = z.infer<typeof listOrganizerStaffQuerySchema>;



