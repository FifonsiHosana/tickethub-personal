import type { NextFunction, Request, Response } from 'express';
import { FinanceService } from './finance.service.js';
import type { purchaseTicketPaymentInput } from './finance.schema.js';
import { AppError } from '@/middleware/errorHandler.js';
import { verifyPaystackSignature } from './finance.utils.js';
import payoutsService from '@/modules/admin/payouts/payouts.service.js';

export class FinanceController {
  private financeService = new FinanceService();

  handlePayment = async (
    req: Request<{}, {}, purchaseTicketPaymentInput>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.financeService.switchToPaymentMethod(req.body);

      return res.status(200).json({
        status: 'success',
        message: 'Money business',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  paystackWebhookHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const signature = req.headers['x-paystack-signature'];
      if (!verifyPaystackSignature(req.body, signature)) {
        throw new AppError(401, 'You are unauthorized');
      }

      const event = req.body.event;
      if (event === 'transfer.success' || event === 'transfer.failed') {
        await payoutsService.handleTransferWebhook(req.body);
      } else {
        await this.financeService.handlePaystackWebhook(req.body);
      }

      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  };
}
