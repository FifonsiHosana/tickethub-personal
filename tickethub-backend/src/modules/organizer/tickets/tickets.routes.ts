import { Router } from 'express';

import {
  getEventTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  listTicketTypes,
  createTicketType,
  previewInvalidTickets,
  invalidateIssuedTicket,
  swapIssuedTicket,
} from './tickets.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { validate } from '@/middleware/validate.js';

import {
  createTicketSchema,
  updateTicketSchema,
  createTicketTypeSchema,
  invalidateTicketItemSchema,
  swapTicketItemSchema,
} from './tickets.schema.js';

const router = Router();

router.get(
  '/invalid-preview',
  authenticate,
  authorize('organizer'),
  previewInvalidTickets,
);

router.patch(
  '/items/:ticketIdentifier/invalidate',
  authenticate,
  authorize('organizer'),
  validate(invalidateTicketItemSchema),
  invalidateIssuedTicket,
);

router.patch(
  '/items/:ticketIdentifier/swap',
  authenticate,
  authorize('organizer'),
  validate(swapTicketItemSchema),
  swapIssuedTicket,
);

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
