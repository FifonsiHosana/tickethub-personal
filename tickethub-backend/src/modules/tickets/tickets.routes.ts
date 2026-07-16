import { Router } from 'express';

import controller from './tickets.controller.js';

import { validate } from '@/middleware/validate.js';

import { purchaseTicketSchema, checkInTicketSchema } from './tickets.schema.js';

// Authentication middleware
// import { authenticate } from '@/middleware/authenticate';
// Permission middleware
// import { authorize } from '@/middleware/authorize';

const router = Router();

/**
 * Customer purchases tickets
 */
router.post(
  '/',

  //   authenticate,

  validate(purchaseTicketSchema),

  controller.purchaseTickets,
);

/**
 * Staff scans/checks in ticket
 */
router.post(
  '/check-in',

  //   authenticate, // middleware to be done

  //   authorize('tickets:checkin'), // middleware to be done

  validate(checkInTicketSchema),

  controller.checkInTicket,
);

export default router;
