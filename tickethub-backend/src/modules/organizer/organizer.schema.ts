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

export type CreateOrganizerEventType = z.infer<
  typeof createOrganizerEventSchema
>;
export type UpdateOrganizerEventType = z.infer<
  typeof updateOrganizerEventSchema
>;
export type OrganizerEventsQueryType = z.infer<
  typeof organizerEventsQuerySchema
>;
