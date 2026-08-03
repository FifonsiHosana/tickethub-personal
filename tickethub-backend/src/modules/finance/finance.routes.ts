import express, { Router } from 'express';
import { FinanceController } from './finance.controller.js';
import { validate } from '@/middleware/validate.js';
import { purchaseTicketPaymentSchema } from './finance.schema.js';

const router = Router();

const financeController = new FinanceController();

router.get(
  '/mobile-money-platforms',
  financeController.getMobileMoneyPlatforms,
);
router.get('/banks', financeController.getBanks);
router.post(
  '/',
  validate(purchaseTicketPaymentSchema),
  financeController.handlePayment,
);
router.post('/webhook/paystack', financeController.paystackWebhookHandler);

export default router;
