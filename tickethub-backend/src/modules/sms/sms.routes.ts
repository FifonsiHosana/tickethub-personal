import { Router } from 'express';
import smsController from './sms.controller.js';
import { validate } from '@/middleware/validate.js';
import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { sendSmsSchema } from './sms.schema.js';

const router = Router();

router.get(
  '/balance',
  authenticate,
  authorize('organizer'),
  smsController.getBalance,
);

router.get(
  '/history',
  authenticate,
  authorize('organizer'),
  smsController.getHistory,
);

router.post(
  '/',
  authenticate,
  authorize('organizer'),
  validate(sendSmsSchema),
  smsController.sendSms,
);

export default router;
