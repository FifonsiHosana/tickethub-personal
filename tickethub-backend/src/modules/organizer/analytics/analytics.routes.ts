import { Router } from 'express';

import {
  getOverviewAnalyticsController,
  getRevenueTrendController,
  getEventPerformanceController,
  getTicketPerformanceController,
} from './analytics.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';

import { authorize } from '@/middleware/auth/role.middleware.js';

import { validateQuery } from '@/middleware/validate.js';

import { revenueTrendSchema } from './analytics.schema.js';

const router = Router();

router.use(
  authenticate,

  authorize('organizer'),
);

/**
 * Dashboard overview cards
 *
 * GET
 * /organizer/analytics/overview
 */
router.get('/overview', getOverviewAnalyticsController);

/**
 * Revenue chart
 *
 * GET
 * /organizer/analytics/revenue-trend
 *
 * Query:
 *
 * from
 * to
 */
router.get(
  '/revenue-trend',

  validateQuery(revenueTrendSchema),

  getRevenueTrendController,
);

/**
 * Event performance table/chart
 *
 * GET
 * /organizer/analytics/events
 */
router.get(
  '/events',

  getEventPerformanceController,
);

/**
 * Ticket performance
 *
 * GET
 * /organizer/analytics/tickets
 */
router.get(
  '/tickets',

  getTicketPerformanceController,
);

export default router;
