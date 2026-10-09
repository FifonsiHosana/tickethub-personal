import { Router } from 'express';
import controller from './checkout-v2.controller.js';
import { checkoutV2Schema } from './checkout-v2.schema.js';
import { validate } from '@/middleware/validate.js';
import { checkoutAttemptLimit } from '@/middleware/rateLimit.js';
import { optionalAuthenticate } from '@/middleware/auth/auth.middleware.js';

const router = Router();

router.post(
  '/',
  checkoutAttemptLimit,
  optionalAuthenticate,
  validate(checkoutV2Schema),
  controller.initiate,
);

export default router;
