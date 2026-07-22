import { Router } from 'express';
import controller from './events.controller.js';
import categoriesController from './categories.controller.js';
import { validateQuery } from '@/middleware/validate.js';
import { getPublishedEventsQuerySchema } from './events.schema.js';

const router = Router();
router.get('/categories', categoriesController.listCategories);
router.get('/', validateQuery(getPublishedEventsQuerySchema), controller.getPublishedEvents);
router.get('/:id', controller.getEventById);
router.get('/:id/tickets', controller.getEventTickets);

export default router;
