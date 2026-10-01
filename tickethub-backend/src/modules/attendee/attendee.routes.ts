import { Router } from 'express';
import {
  getAttendeeOrderFromReference,
  getAttendeeOrderHistory,
} from './attendee.controller.js';
import { validateQuery } from '@/middleware/validate.js';
import {
  orderFromReferenceQuerySchema,
  orderHistoryQuerySchema,
} from './attendee.schema.js';
import { authenticate } from '@/middleware/auth/auth.middleware.js';

const router = Router();

router.get(
  '/orders',
  authenticate,
  validateQuery(orderHistoryQuerySchema),
  getAttendeeOrderHistory,
);

router.get(
  '/order-from-reference',
  // authenticate,
  validateQuery(orderFromReferenceQuerySchema),
  getAttendeeOrderFromReference,
);

export default router;
