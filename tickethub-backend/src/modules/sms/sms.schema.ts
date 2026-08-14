import { z } from 'zod';

export type SmsStatus = 'sent' | 'scheduled' | 'draft' | 'failed';

export const sendSmsSchema = z
  .object({
    message: z.string().min(1, 'SMS message is required'),
    recipients: z
      .array(z.string().min(8, 'Invalid recipient phone number'))
      .nonempty('At least one recipient is required'),
    sender: z
      .string()
      .max(11, 'Sender ID must be at most 11 characters')
      .optional(),
    scheduled: z.boolean().optional().default(false),
    scheduleDate: z.union([z.string(), z.null()]).optional(),
    meta: z
      .object({
        audienceMode: z.string().optional(),
        audienceLabel: z.string().optional(),
        selectedEventId: z.union([z.string(), z.number()]).optional(),
        selectedGroupIds: z.array(z.union([z.string(), z.number()])).optional(),
      })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (value.scheduled && !value.scheduleDate) {
      ctx.addIssue({
        code: "custom",
        message: 'Scheduled SMS requires scheduleDate in ISO format',
      });
    }
  });

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
