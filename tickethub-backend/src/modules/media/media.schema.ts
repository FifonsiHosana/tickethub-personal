import { z } from 'zod';

export const uploadMediaSchema = z.object({
  body: z.object({
    folder: z.enum(['events', 'profiles', 'sponsors']).default('events'),

    type: z.enum(['Banner', 'Gallery', 'Sponsor']).optional(),
  }),
});

export type UploadMediaBody = z.infer<typeof uploadMediaSchema>['body'];