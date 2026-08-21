import { Router } from 'express';
import creditController from './credit.controller.js';
import { authenticate } from '@/middleware/auth/auth.middleware.js';
import { authorize } from '@/middleware/auth/role.middleware.js';

const router = Router();

router.get(
  '/balance',
  authenticate,
  authorize('organizer'),
  creditController.getBalance.bind(creditController),
);

router.post(
  '/purchase',
  authenticate,
  authorize('organizer'),
  creditController.initiateCreditPurchase.bind(creditController),
);

/**
 * Called by the frontend AFTER the Paystack popup fires onSuccess.
 * Verifies the transaction with Paystack, then credits the wallet immediately
 * so the UI reflects the new balance without waiting for the webhook.
 */
router.post(
  '/verify',
  authenticate,
  authorize('organizer'),
  creditController.verifyAndCredit.bind(creditController),
);

/**
 * Paystack webhook – no auth middleware (Paystack signs the body instead).
 * Responds 200 immediately; processing is done asynchronously.
 */
router.post(
  '/webhook/paystack',
  creditController.handlePaystackWebhook.bind(creditController),
);
/**
 * Transaction history data
 * Responds 200 immediately;.
 */
router.get(
  '/transactions',
  authenticate,
  authorize('organizer'),
  creditController.getCreditTransactions.bind(creditController),
);

export default router;
