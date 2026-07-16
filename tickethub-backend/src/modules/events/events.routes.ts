import { Router } from 'express';
import controller from './events.controller.js';

const router = Router();
router.get('/', controller.getPublishedEvents);
router.get('/:id', controller.getEventById);
router.get('/:id/tickets', controller.getEventTickets);

export default router;
