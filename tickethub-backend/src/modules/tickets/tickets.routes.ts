import { Router } from 'express';
import controller from './tickets.controller.js';
import { validate } from '@/middleware/validate.js';
import { purchaseTicketSchema, checkInTicketSchema } from './tickets.schema.js';
import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';

const router = Router();

/**
 * Public ticket detail (no auth)
 */
router.get('/:ticketIdentifier', controller.getTicketByIdentifier);

/**
 * Customer purchases tickets
 */
router.post('/', validate(purchaseTicketSchema), controller.purchaseTickets);

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

export default router;
