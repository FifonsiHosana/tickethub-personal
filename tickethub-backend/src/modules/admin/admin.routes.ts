import { Router } from 'express';
import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';

import settingsRoutes from './settings/settings.routes.js';
import usersRoutes from './users/users.routes.js';
import eventsRoutes from './events/events.routes.js';
import analyticsRoutes from './analytics/analytics.routes.js';
import payoutsRoutes from './payouts/payouts.routes.js';
import refundsRoutes from './refunds/refunds.routes.js';

const router = Router();

router.use(authenticate);
router.use(authorize('admin'));

router.use('/settings', settingsRoutes);
router.use('/users', usersRoutes);
router.use('/events', eventsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/payouts', payoutsRoutes);
router.use('/refunds', refundsRoutes);

export default router;
