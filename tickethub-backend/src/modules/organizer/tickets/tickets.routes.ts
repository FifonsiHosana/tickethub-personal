import { Router } from 'express';

import {
  getEventTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  listTicketTypes,
  createTicketType,
} from './tickets.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { validate } from '@/middleware/validate.js';

import { createTicketSchema, updateTicketSchema, createTicketTypeSchema } from './tickets.schema.js';

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

router.get(
  '/ticket-types',
  authenticate,
  authorize('organizer'),
  listTicketTypes,
);

router.post(
  '/ticket-types',
  authenticate,
  authorize('organizer'),
  validate(createTicketTypeSchema),
  createTicketType,
);

export default router;
