import { Router } from 'express';

import {
  dashboard,
  organizerEvents,
  organizerEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getAllVenues,
} from './organizer.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { validate, validateQuery } from '@/middleware/validate.js';

import organizerTicketsRoutes from './tickets/tickets.routes.js';
import organizerSalesRoutes from './sales/sales.routes.js';
import organizerReportsRoutes from './reports/reports.routes.js';
import organizerAnalyticsRoutes from './analytics/analytics.routes.js';

import {
  organizerEventsQuerySchema,
  createOrganizerEventSchema,
  updateOrganizerEventSchema,
} from '@/modules/organizer/organizer.schema.js';

const router = Router();

router.use(
  '/tickets',
  authenticate,
  authorize('organizer'),
  organizerTicketsRoutes,
);
router.use(
  '/sales',
  authenticate,
  authorize('organizer'),
  organizerSalesRoutes,
);
router.use(
  '/reports',
  authenticate,
  authorize('organizer'),
  organizerReportsRoutes,
);
router.use(
  '/analytics',
  authenticate,
  authorize('organizer'),
  organizerAnalyticsRoutes,
);

/**
 * Organizer Dashboard
 */
router.get('/dashboard', authenticate, authorize('organizer'), dashboard);

/**
 * Organizer Events
 */
router.get(
  '/events',
  authenticate,
  authorize('organizer'),
  validateQuery(organizerEventsQuerySchema),
  organizerEvents,
);

router.get(
  '/events/:id',
  authenticate,
  authorize('organizer'),
  organizerEventById,
);

router.post(
  '/events',
  authenticate,
  authorize('organizer'),
  validate(createOrganizerEventSchema),
  createEvent,
);

router.patch(
  '/events/:id',
  authenticate,
  authorize('organizer'),
  validate(updateOrganizerEventSchema),
  updateEvent,
);

router.patch(
  '/events/:id/cancel',
  authenticate,
  authorize('organizer'),
  cancelEvent,
);

router.get('/event-venues', getAllVenues);

router.delete('/events/:id', authenticate, authorize('organizer'), deleteEvent);

export default router;
