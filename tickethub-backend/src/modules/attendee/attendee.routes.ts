import { Router } from 'express';
import {
  getAttendeeOrderFromReference,
  getAttendeeOrderHistory,
  getAttendeeOrderHistoryDetail,
} from './attendee.controller.js';
import { validateParams, validateQuery } from '@/middleware/validate.js';
import {
  orderFromReferenceQuerySchema,
  orderHistoryDetailParamsSchema,
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
  '/orders/:orderId',
  authenticate,
  validateParams(orderHistoryDetailParamsSchema),
  getAttendeeOrderHistoryDetail,
);

router.get(
  '/order-from-reference',
  validateQuery(orderFromReferenceQuerySchema),
  getAttendeeOrderFromReference,
);

export default router;
