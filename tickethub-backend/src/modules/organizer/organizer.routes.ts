import { Router } from 'express';
import { z } from 'zod';
import validateSafe from 'express-zod-safe';

import {
  dashboard,
  organizerEvents,
  organizerEventById,
  createEventWithTickets,
  updateEvent,
  deleteEvent,
  cancelEvent,
  getAllVenues,
  createVenue,
  eventAttendees,
  listEventStaff,
  createStaffInvite,
  listOrganizerStaff,
  assignEventStaff,
  getPayoutDetails,
  updatePayoutDetails,
} from './organizer.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { validate, validateQuery } from '@/middleware/validate.js';
import { setPayoutDetailsSchema } from '@/modules/admin/payouts/payouts.schema.js';
import categoriesController from '@/modules/events/categories.controller.js';
import { createCategorySchema } from '@/modules/events/events.schema.js';

import organizerTicketsRoutes from './tickets/tickets.routes.js';
import organizerSalesRoutes from './sales/sales.routes.js';
import organizerOrdersRoutes from './orders/orders.routes.js';
import organizerReportsRoutes from './reports/reports.routes.js';
import organizerAnalyticsRoutes from './analytics/analytics.routes.js';

import {
  organizerEventsQuerySchema,
  createEventWithTicketsSchema,
  updateOrganizerEventSchema,
  listOrganizerStaffQuerySchema,
  assignStaffSchema,
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
  '/orders',
  authenticate,
  authorize('organizer'),
  organizerOrdersRoutes,
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
  authorize('organizer', 'event_staff'),
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
  '/events/with-tickets',
  authenticate,
  authorize('organizer'),
  validate(createEventWithTicketsSchema),
  createEventWithTickets,
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

router.post(
  '/categories',
  authenticate,
  authorize('organizer'),
  validate(createCategorySchema),
  categoriesController.createCategory,
);

router.get(
  '/events/:eventId/attendees',
  authenticate,
  authorize('organizer', 'event_staff'),
  eventAttendees,
);

router.get('/event-venues', getAllVenues);
router.post('/event-venues', createVenue);

router.get(
  '/events/:eventId/staff',
  authenticate,
  authorize('organizer'),
  listEventStaff,
);

router.post(
  '/events/:eventId/staff/invite',
  authenticate,
  authorize('organizer'),
  createStaffInvite,
);

router.get(
  '/staff',
  authenticate,
  authorize('organizer'),
  validateQuery(listOrganizerStaffQuerySchema),
  listOrganizerStaff,
);

router.post(
  '/events/:eventId/staff/assign',
  authenticate,
  authorize('organizer'),
  validateSafe({ body: assignStaffSchema, params: z.object({ eventId: z.string() }) }),
  assignEventStaff,
);

router.get('/payout-details', authenticate, authorize('organizer'), getPayoutDetails);
router.put(
  '/payout-details',
  authenticate,
  authorize('organizer'),
  validate(setPayoutDetailsSchema),
  updatePayoutDetails,
);

router.delete('/events/:id', authenticate, authorize('organizer'), deleteEvent);

export default router;
