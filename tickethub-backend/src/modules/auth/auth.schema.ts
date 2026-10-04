import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(64)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

const identitySchema = z.string().trim().min(1, 'Email or phone is required.');

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.email().transform((email) => email.toLowerCase()),
  password: passwordSchema,
  roleId: z.number().int().positive(),
  phoneNumber: z.string(),
  inviteToken: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

export const requestPhoneLoginOtpSchema = z.object({
  identifier: identitySchema,
});

export const verifyPhoneLoginOtpSchema = z.object({
  identifier: identitySchema,
  otp: z.string().length(6).regex(/^\d+$/),
});

export const verifyOtpSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  otp: z.string().length(6).regex(/^\d+$/),
});

export const resendOtpSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
});

export const sendOtpSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()).optional(),
  identifier: identitySchema.optional(),
});

export const completeRegisterSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()).optional(),
  identifier: identitySchema.optional(),
  otp: z.string().length(6).regex(/^\d+$/),
  password: passwordSchema,
  firstName: z.string().trim().min(2).max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  roleName: z.enum(['attendee', 'organizer']).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()).optional(),
  identifier: identitySchema.optional(),
}).refine((data) => data.identifier || data.email, {
  message: 'Email or phone is required.',
  path: ['identifier'],
});

export const resetPasswordSchema = z.object({
  token: z.string().optional(),
  identifier: identitySchema.optional(),
  otp: z.string().length(6).regex(/^\d+$/).optional(),
  password: passwordSchema,
}).refine((data) => data.token || (data.identifier && data.otp), {
  message: 'Reset token or phone verification code is required.',
  path: ['token'],
});

export type CreateRegisterInput = z.infer<typeof registerSchema>;
export type CreateLoginInput = z.infer<typeof loginSchema>;
export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type CompleteRegisterInput = z.infer<typeof completeRegisterSchema>;

