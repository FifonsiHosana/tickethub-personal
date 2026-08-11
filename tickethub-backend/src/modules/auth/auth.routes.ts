import { AuthController } from './auth.controller.js';
import { validate } from '@/middleware/validate.js';
import { authenticate } from '@/middleware/auth/auth.middleware.js';
import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  sendOtpSchema,
  completeRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema.js';
import { Router } from 'express';

const router = Router();

const authController = new AuthController();

router.get('/roles', authController.getUserRoles);
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);
router.post('/send-otp', validate(sendOtpSchema), authController.sendOtp);
router.post(
  '/complete-register',
  validate(completeRegisterSchema),
  authController.completeRegister,
);
router.post('/become-organizer', authenticate, authController.becomeOrganizer);
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default router;
