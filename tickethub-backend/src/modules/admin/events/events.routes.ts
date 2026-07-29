import { Router } from 'express';
import { validate, validateQuery } from '@/middleware/validate.js';

import {
  listEvents,
  getEventDetail,
  approveEvent,
  rejectEvent,
} from './events.controller.js';

import {
  listAdminEventsQuerySchema,
  rejectEventSchema,
} from './events.schema.js';

const router = Router();

router.get('/', validateQuery(listAdminEventsQuerySchema), listEvents);
router.get('/approval-queue', (req, res, next) => {
  req.query.approvalStatus = 'Pending';
  listEvents(req, res, next);
});
router.get('/:id', getEventDetail);
router.patch('/:id/approve', approveEvent);
router.patch('/:id/reject', validate(rejectEventSchema), rejectEvent);

export default router;
