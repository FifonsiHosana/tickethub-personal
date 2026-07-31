import { Router } from 'express';
import { validate, validateQuery } from '@/middleware/validate.js';

import {
  listUsers,
  getUserById,
  suspendUser,
  verifyOrganizer,
  resetUserPassword,
  listOrganizers,
  verificationQueue,
} from './users.controller.js';

import {
  listUsersQuerySchema,
  suspendUserSchema,
  resetUserPasswordSchema,
  verificationQueueQuerySchema,
} from './users.schema.js';

const router = Router();

router.get('/', validateQuery(listUsersQuerySchema), listUsers);
router.get('/:id', getUserById);
router.patch('/:id/suspend', validate(suspendUserSchema), suspendUser);
router.patch('/:id/verify', verifyOrganizer);
router.patch(
  '/:id/reset-password',
  validate(resetUserPasswordSchema),
  resetUserPassword,
);

router.get('/organizers/list', listOrganizers);
router.get('/organizers/verification-queue', validateQuery(verificationQueueQuerySchema), verificationQueue);

export default router;
