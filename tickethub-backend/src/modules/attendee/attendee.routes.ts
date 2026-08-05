import { Router } from 'express';
import { getAttendeeOrderHistory } from './attendee.controller.js';
import { validateQuery } from '@/middleware/validate.js';
import { orderHistoryQuerySchema } from './attendee.schema.js';
import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';

const router = Router();

router.get(
  '/orders',
  authenticate,
  authorize('attendee'),
  validateQuery(orderHistoryQuerySchema),
  getAttendeeOrderHistory,
);

export default router;