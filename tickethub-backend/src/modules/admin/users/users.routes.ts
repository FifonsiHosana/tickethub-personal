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
  organizerProfile,
  organizerStats,
  organizerEvents,
  organizerOrders,
} from './users.controller.js';

import {
  listUsersQuerySchema,
  suspendUserSchema,
  resetUserPasswordSchema,
  verificationQueueQuerySchema,
  organizerDetailQuerySchema,
  organizerDetailListQuerySchema,
} from './users.schema.js';

const router = Router();

router.get('/', validateQuery(listUsersQuerySchema), listUsers);
router.get('/organizers/list', listOrganizers);
router.get('/organizers/verification-queue', validateQuery(verificationQueueQuerySchema), verificationQueue);
router.get('/organizers/:id/detail', validateQuery(organizerDetailQuerySchema), organizerProfile);
router.get('/organizers/:id/stats', validateQuery(organizerDetailQuerySchema), organizerStats);
router.get('/organizers/:id/events', validateQuery(organizerDetailListQuerySchema), organizerEvents);
router.get('/organizers/:id/orders', validateQuery(organizerDetailListQuerySchema), organizerOrders);
router.get('/:id', getUserById);
router.patch('/:id/suspend', validate(suspendUserSchema), suspendUser);
router.patch('/:id/verify', verifyOrganizer);
router.patch('/:id/reset-password', validate(resetUserPasswordSchema), resetUserPassword);

export default router;
