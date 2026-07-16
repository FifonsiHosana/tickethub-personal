import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(64)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.');

export const registerSchema = z.object({
  firstName: z.string().trim().min(2).max(100),
  lastName: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.toLowerCase()),
  password: passwordSchema,
  roleId: z.number().int().positive(),
});

export const loginSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

export const verifyOtpSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
  otp: z.string().length(6).regex(/^\d+$/),
});

export const resendOtpSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
});

export const forgotPasswordSchema = z.object({
  email: z.email().transform((email) => email.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: passwordSchema,
});

export type CreateRegisterInput = z.infer<typeof registerSchema>;
export type CreateLoginInput = z.infer<typeof loginSchema>;

