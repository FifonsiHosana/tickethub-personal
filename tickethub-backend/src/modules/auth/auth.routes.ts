import { AuthController } from './auth.controller.js';
import { validate } from '@/middleware/validate.js';
import {
  loginSchema,
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
} from './auth.schema.js';
import { Router } from 'express';

const router = Router();

const authController = new AuthController();

router.get('/roles', authController.getUserRoles);
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);

export default router;
