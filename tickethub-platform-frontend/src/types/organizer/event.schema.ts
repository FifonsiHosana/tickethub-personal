import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const imageSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, "Maximum file size is 5MB")
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    "Unsupported image format"
  );

export const ticketSchema = z.object({
  name: z.string().min(3, "Ticket name must be at least 3 characters"),
  ticketTypeId: z.number().positive().optional(),
  ticketTypeName: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  totalCount: z.number().positive("Quantity must be positive").optional(),
  benefits: z.string().optional(),
  salesStartDate: z.string().optional(),
  salesEndDate: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Event title must be at least 3 characters")
    .max(100),

  description: z.string().optional(),

  eventVenueId: z.number({ message: "Please select a venue" }).positive(),

  capacity: z.number({ message: "Please enter capacity" }).positive(),

  dateAndTime: z.string().min(1, "Please select a date and time"),

  termsAndConditions: z.string().min(1, "Please enter terms and conditions"),

  categoryIds: z.array(z.number().int().positive()).optional(),

  bannerImage: imageSchema,

  tickets: z.array(ticketSchema).min(1, "Add at least one ticket"),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
