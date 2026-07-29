import { z } from 'zod';

export const initiatePayoutSchema = z.object({
  organizerId: z.number().int().positive(),
  amount: z.number().positive(),
});

export const setPayoutDetailsSchema = z
  .object({
    payoutMethod: z.enum(['bank', 'mobile_money']),
    bankName: z.string().min(1).optional(),
    accountNumber: z.string().min(1).optional(),
    accountName: z.string().min(1).optional(),
    mobileMoneyProvider: z.string().min(1).optional(),
    mobileMoneyNumber: z.string().min(1).optional(),
    mobileMoneyName: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.payoutMethod === 'bank') {
        return !!data.bankName && !!data.accountNumber && !!data.accountName;
      }
      return (
        !!data.mobileMoneyProvider &&
        !!data.mobileMoneyNumber &&
        !!data.mobileMoneyName
      );
    },
    {
      message:
        'All fields for the selected payout method must be provided',
    },
  );

export type InitiatePayoutType = z.infer<typeof initiatePayoutSchema>;
export type SetPayoutDetailsType = z.infer<typeof setPayoutDetailsSchema>;
