import { Router } from 'express';
import { z } from 'zod';
import validateSafe from 'express-zod-safe';

import {
  listRefunds,
  pendingRefundRequests,
  approveRefund,
  rejectRefund,
} from './refunds.controller.js';

import { rejectRefundSchema } from './refunds.schema.js';

const router = Router();

router.get('/', listRefunds);
router.get('/requests', pendingRefundRequests);
router.patch('/:id/approve', approveRefund);
router.patch(
  '/:id/reject',
  validateSafe({
    body: rejectRefundSchema,
    params: z.object({ id: z.string() }),
  }),
  rejectRefund,
);

export default router;
