import { z } from "zod";
import { isGoogleMapLink } from "@/utils/googleMapLink";

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
    "Unsupported image format",
  );

export const ticketSchema = z.object({
  id: z.number().positive().optional(),
  ticketTypeId: z.number().positive().optional(),
  ticketTypeName: z.string().trim().min(2, "Ticket type is required"),
  price: z.number().positive("Price must be positive"),
  totalCount: z.number().positive("Quantity must be positive").optional(),
  totalSold: z.number().optional(),
  remaining: z.number().optional(),
  benefits: z.string().optional(),
  isVisible: z.boolean().optional(),
  salesStartDate: z.string().optional(),
  salesEndDate: z.string().optional(),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

export const venueSchema = z.object({
  venue_name: z.string().min(1, "Venue name is required"),
  address: z.string().optional(),
  city_or_town: z.string().min(1, "City/Town is required"),
  country: z.string().min(1, "Country is required"),
  googleMapLink: z.string().optional().refine(isGoogleMapLink, "Enter a valid Google Maps link"),
});

export type VenueFormValues = z.infer<typeof venueSchema>;

export const createEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Event title must be at least 3 characters")
      .max(100),

    description: z.string().optional(),

    eventVenueId: z.number().positive().optional(),

    venue: venueSchema,

    capacity: z.number({ message: "Please enter capacity" }).positive(),

    dateAndTime: z.string().min(1, "Please select a start date and time"),

    dateAndTimeEnd: z.string().min(1, "Please select an end date and time"),

    termsAndConditions: z.string().optional(),

    categoryIds: z.array(z.number().int().positive()).optional(),

    bannerImage: imageSchema,

    tickets: z.array(ticketSchema).min(1, "Add at least one ticket"),
  })
  .refine(
    (data) => {
      if (!data.dateAndTime || !data.dateAndTimeEnd) return true;
      return (
        new Date(data.dateAndTimeEnd).getTime() >=
        new Date(data.dateAndTime).getTime()
      );
    },
    {
      message: "End date must be after start date",
      path: ["dateAndTimeEnd"],
    },
  )
  .refine(
    (data) => {
      if (data.capacity === undefined || !data.tickets?.length) return true;
      const total = data.tickets.reduce(
        (sum, t) => sum + (t.totalCount ?? data.capacity),
        0,
      );
      return total <= (data.capacity as number);
    },
    {
      message: "Total ticket quantity cannot exceed event capacity",
      path: ["tickets"],
    },
  );

export type CreateEventFormValues = z.infer<typeof createEventSchema>;

/**
 * Edit mode: same fields as create, but nothing that already exists is
 * forced — banner (keep current), end date, venue (keep current) and
 * tickets (managed read-only) are all optional so saving never blocks
 * silently on pre-existing data.
 */
export const editEventSchema = z
  .object({
    title: z
      .string()
      .min(3, "Event title must be at least 3 characters")
      .max(100),

    description: z.string().optional(),

    eventVenueId: z.number().positive().optional(),

    venue: venueSchema.optional(),

    capacity: z.number({ message: "Please enter capacity" }).positive(),

    dateAndTime: z.string().min(1, "Please select a start date and time"),

    dateAndTimeEnd: z.string().optional(),

    termsAndConditions: z.string().optional(),

    categoryIds: z.array(z.number().int().positive()).optional(),

    bannerImage: imageSchema.optional(),

    tickets: z.array(ticketSchema).optional(),
  })
  .refine(
    (data) => {
      if (!data.dateAndTime || !data.dateAndTimeEnd) return true;
      return (
        new Date(data.dateAndTimeEnd).getTime() >=
        new Date(data.dateAndTime).getTime()
      );
    },
    {
      message: "End date must be after start date",
      path: ["dateAndTimeEnd"],
    },
  )
  .refine(
    (data) => {
      if (data.capacity === undefined || !data.tickets?.length) return true;
      const total = data.tickets.reduce(
        (sum, t) => sum + (t.totalCount ?? data.capacity),
        0,
      );
      return total <= (data.capacity as number);
    },
    {
      message: "Total ticket quantity cannot exceed event capacity",
      path: ["tickets"],
    },
  );

export type EditEventFormValues = z.infer<typeof editEventSchema>;






