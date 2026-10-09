import { Router } from 'express';
import {
  overview,
  revenueTrend,
  userTrend,
  eventStats,
  organizerPerformance,
  completedOrders,
  exportCompletedOrders,
} from './analytics.controller.js';

const router = Router();

router.get('/overview', overview);
router.get('/revenue', revenueTrend);
router.get('/users', userTrend);
router.get('/events', eventStats);
router.get('/organizers', organizerPerformance);
router.get('/completed-orders/export', exportCompletedOrders);
router.get('/completed-orders', completedOrders);

export default router;
