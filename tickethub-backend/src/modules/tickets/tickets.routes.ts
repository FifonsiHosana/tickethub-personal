import { Router } from 'express';
import controller from './tickets.controller.js';
import { validate } from '@/middleware/validate.js';
import {
  purchaseTicketSchema,
  checkInTicketSchema,
  resendMailSchema,
} from './tickets.schema.js';
import {
  authenticate,
  optionalAuthenticate,
} from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';

const router = Router();

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
  validate(purchaseTicketSchema),
  controller.purchaseTickets,
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

router.get(
  '/events/:eventId/phone-numbers',
  authenticate,
  authorize('organizer', 'event_staff'),
  controller.getAtttendeesPhoneNumber,
);
export default router;
