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

export const createEventSchema = z.object({
  title: z.string().min(3).max(100),

  description: z.string().optional(),

  eventVenueId: z.number(),

  capacity: z.number(),

  dateAndTime: z.string(),

  termsAndConditions: z.string().optional(),

  bannerImage: imageSchema.optional(),

  galleryImages: z.array(imageSchema).optional(),

  sponsorImages: z.array(imageSchema).optional(),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
