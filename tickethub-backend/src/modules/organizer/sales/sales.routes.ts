import { Router } from 'express';

import {
  getSales,
  getSaleDetails,
  getEventSalesController,
  getSalesSummaryController,
  getRevenueController,
  getTicketSalesController,
} from './sales.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';

import { authorize } from '@/middleware/auth/role.middleware.js';

import { validate } from '@/middleware/validate.js';

import {
  getSalesSchema,
  getSaleByIdSchema,
  getEventSalesSchema,
  getRevenueBreakdownSchema,
} from './sales.schema.js';

const router = Router();

router.use(authenticate, authorize('organizer'));

/**
 * Organizer sales table
 *
 * GET /organizer/sales
 */
router.get('/', validate(getSalesSchema), getSales);

/**
 * Single transaction details
 *
 * GET /organizer/sales/:orderId
 */
router.get('/:orderId', validate(getSaleByIdSchema), getSaleDetails);

/**
 * Event specific sales
 *
 * GET /organizer/events/:eventId/sales
 */
router.get(
  '/events/:eventId',
  validate(getEventSalesSchema),
  getEventSalesController,
);

/**
 * Dashboard summary cards
 *
 * GET /organizer/sales/summary
 */
router.get('/summary', getSalesSummaryController);

/**
 * Revenue chart
 *
 * GET /organizer/sales/revenue
 */
router.get(
  '/revenue',
  validate(getRevenueBreakdownSchema),
  getRevenueController,
);

/**
 * Ticket performance chart
 *
 * GET /organizer/sales/tickets
 */
router.get('/tickets', getTicketSalesController);

export default router;
