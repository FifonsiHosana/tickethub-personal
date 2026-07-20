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
import { validateParams, validateQuery } from '@/middleware/validate.js';

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
router.get('/', validateQuery(getSalesSchema), getSales);

/**
 * Dashboard summary cards
 *
 * GET /organizer/sales/summary
 */
router.get('/summary', getSalesSummaryController);

/**
 * Event specific sales
 *
 * GET /organizer/sales/events/:eventId
 */
router.get(
  '/events/:eventId',
  validateParams(getEventSalesSchema),
  getEventSalesController,
);

/**
 * Revenue chart
 *
 * GET /organizer/sales/revenue
 */
router.get(
  '/revenue',
  validateQuery(getRevenueBreakdownSchema),
  getRevenueController,
);

/**
 * Ticket performance chart
 *
 * GET /organizer/sales/tickets
 */
router.get('/tickets', getTicketSalesController);

/**
 * Single transaction details
 *
 * GET /organizer/sales/:orderId
 * (must stay last — it's a catch-all for anything not matched above)
 */
router.get('/:orderId', validateParams(getSaleByIdSchema), getSaleDetails);

export default router;
