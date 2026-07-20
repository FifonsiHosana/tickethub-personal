import { Router } from 'express';

import { exportSalesReport } from './reports.controller.js';

import { authenticate } from '@/middleware/auth/auth.middleware.js';

import { authorize } from '@/middleware/auth/role.middleware.js';

// import { validateQuery } from '@/middleware/validate.js';

// import { salesReportQuerySchema } from './reports.schema.js';

const router = Router();

router.use(authenticate, authorize('organizer'));

/**
 * Export sales report
 *
 * GET
 * /organizer/reports/sales
 *
 * Query:
 *
 * ?format=pdf
 *
 * ?format=excel
 *
 * ?eventId=2
 *
 * ?from=2026-01-01T00:00:00Z
 *
 * ?to=2026-12-31T23:59:59Z
 */
router.get('/sales', exportSalesReport);

export default router;
