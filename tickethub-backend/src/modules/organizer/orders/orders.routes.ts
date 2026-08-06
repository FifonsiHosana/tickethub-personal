import { Router } from 'express';

import { getOrders } from './orders.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';
import { validateQuery } from '@/middleware/validate.js';

import { getOrdersSchema } from './orders.schema.js';

const router = Router();

router.use(authenticate, authorize('organizer'));

/**
 * Organizer orders table (all orders incl. Pending)
 *
 * GET /organizer/orders
 */
router.get('/', validateQuery(getOrdersSchema), getOrders);

export default router;
