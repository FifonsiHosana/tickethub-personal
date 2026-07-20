import { Router } from 'express';

import {
  getEventTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from './tickets.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { validate } from '@/middleware/validate.js';

import { createTicketSchema, updateTicketSchema } from './tickets.schema.js';

const router = Router();

router.get(
  '/events/:eventId/tickets',
  authenticate,
  authorize('organizer'),
  getEventTickets,
);

router.post(
  '/events/:eventId/tickets',
  authenticate,
  authorize('organizer'),
  validate(createTicketSchema),
  createTicket,
);

router.patch(
  '/tickets/:ticketId',
  authenticate,
  authorize('organizer'),
  validate(updateTicketSchema),
  updateTicket,
);

router.delete(
  '/tickets/:ticketId',
  authenticate,
  authorize('organizer'),
  deleteTicket,
);

export default router;
