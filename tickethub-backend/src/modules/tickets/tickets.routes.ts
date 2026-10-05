import { Router } from 'express';
import controller from './tickets.controller.js';
import { validate } from '@/middleware/validate.js';
import {
  purchaseTicketSchema,
  checkInTicketSchema,
  resendMailSchema,
  generateTicketsSchema,
} from './tickets.schema.js';
import {
  authenticate,
  optionalAuthenticate,
} from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { checkoutAttemptLimit } from '@/middleware/rateLimit.js';

const router = Router();

router.get(
  '/events/:eventId/phone-numbers',
  authenticate,
  authorize('organizer', 'event_staff'),
  controller.getAtttendeesPhoneNumber,
);

/**
 * Public ticket detail (no auth)
 */
router.get('/:ticketIdentifier', controller.getTicketByIdentifier);

/**
 * Customer purchases tickets (optional auth — owner id derived from token)
 */
router.post(
  '/',
  optionalAuthenticate,
  checkoutAttemptLimit,
  validate(purchaseTicketSchema),
  controller.purchaseTickets,
);

/**
 * Staff/organizer generates tickets
 */
router.post(
  '/status',
  authenticate,
  authorize('organizer', 'event_staff'),
  validate(generateTicketsSchema),
  controller.generateTickets,
);

/**
 * Staff scans/checks in ticket
 */
router.post(
  '/check-in',
  authenticate,
  authorize('organizer', 'event_staff'),
  validate(checkInTicketSchema),

  controller.checkInTicket,
);

/**
 * Staff/organizer resends ticket email
 */
router.post(
  '/resend-mail',
  authenticate,
  authorize('organizer', 'event_staff'),
  validate(resendMailSchema),

  controller.resendEmail,
);

export default router;

