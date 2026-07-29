import { Router } from 'express';
import { validate } from '@/middleware/validate.js';

import {
  listPayouts,
  initiatePayout,
  setPayoutDetails,
} from './payouts.controller.js';

import {
  initiatePayoutSchema,
  setPayoutDetailsSchema,
} from './payouts.schema.js';

const router = Router();

router.get('/', listPayouts);
router.post('/', validate(initiatePayoutSchema), initiatePayout);
router.patch(
  '/organizers/:id/payout-details',
  validate(setPayoutDetailsSchema),
  setPayoutDetails,
);

export default router;
