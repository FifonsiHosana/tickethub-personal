import type { NextFunction, Request, Response } from 'express';
import { AppError } from '@/middleware/errorHandler.js';
import type { SendSmsInput } from './sms.schema.js';
import { smsService, type SmsSendResult } from './sms.service.js';

export class SmsController {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const wallet = await smsService.getBalance(userId);

      if (!wallet) {
        return res.status(200).json({
          success: true,
          data: {
            totalCredit: '0.00',
            creditUsed: '0.00',
            creditLeft: '0.00',
            isActive: true,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          totalCredit: wallet.totalCredit,
          creditUsed: wallet.creditUsed,
          creditLeft: wallet.creditLeft,
          isActive: wallet.isActive,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const history = await smsService.getHistory(userId);

      return res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async sendSms(
    req: Request<{}, {}, SendSmsInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const result: SmsSendResult = await smsService.sendSms({
        userId,
        ...req.body,
      });

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }
}

export default new SmsController();