import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { eq, and } from 'drizzle-orm';
import config from '@/config/config.js';
import { db } from '@/db/client.js';
import { creditWallet, creditTransactions } from '@/db/schema/index.js';
import { AppError } from '@/middleware/errorHandler.js';
import { formatDateForMySQL } from '@/utils/timeDatehelpers.js';
import { verifyPaystackSignature } from '@/modules/finance/finance.utils.js';

const PAYSTACK_INIT_URL = 'https://api.paystack.co/transaction/initialize';
const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';

type InitiateCreditPurchaseInput = {
  credits: number;
  amount: number;
  currency?: string;
  email?: string;
  planName?: string;
};

export class CreditController {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'User not authenticated');

      const [wallet] = await db
        .select()
        .from(creditWallet)
        .where(eq(creditWallet.userId, userId));

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

  async initiateCreditPurchase(
    req: Request<{}, {}, InitiateCreditPurchaseInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;
      if (!userId) throw new AppError(401, 'User not authenticated');

      const { credits, amount, currency = 'GHS', email, planName } = req.body;
      const parsedCredits = Number(credits);
      const parsedAmount = Number(amount);

      if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
        throw new AppError(400, 'Please choose a valid number of credits');
      }
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        throw new AppError(400, 'Please choose a valid amount');
      }

      const reference = `sms-credit-${userId}-${Date.now()}`;
      const customerEmail = email || userEmail || 'organizer@tickethub.app';

      //  Development / no Paystack key 
      if (!config.payment.paystack_api_key) {
        if (process.env.NODE_ENV !== 'development') {
          throw new AppError(503, 'Paystack is not configured for this environment');
        }
        await this.applyPurchasedCredits(userId, parsedCredits, reference);
        return res.status(200).json({
          success: true,
          data: {
            checkoutUrl: `${config.appUrl}/organizer/sms/credits?status=success&reference=${reference}`,
            reference,
            mock: true,
            message: 'Paystack not configured – credits added locally for development.',
          },
        });
      }

      //  Real Paystack initialisation 
      const response = await axios.post(
        PAYSTACK_INIT_URL,
        {
          email: customerEmail,
          amount: Math.round(parsedAmount),
          reference,
          currency,
          metadata: {
            userId,
            credits: parsedCredits,
            planName: planName || 'sms-credits',
            purpose: 'sms-credit-purchase',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.payment.paystack_api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data?.status) {
        throw new AppError(502, 'Paystack initialization failed');
      }

      return res.status(200).json({
        success: true,
        data: {
          checkoutUrl: response.data.data?.authorization_url as string,
          reference: response.data.data?.reference as string,
          accessCode: response.data.data?.access_code as string,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async handlePaystackWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-paystack-signature'];
      if (!verifyPaystackSignature(req.body, signature)) {
        return res.status(401).json({ success: false, message: 'Invalid Paystack signature' });
      }

      res.status(200).json({ success: true, message: 'Webhook received' });

      if (req.body?.event !== 'charge.success') return;

      const metadata = req.body?.data?.metadata ?? {};
      const userId = Number(metadata.userId);
      const credits = Number(metadata.credits);
      const reference = String(req.body?.data?.reference ?? '');

      if (!userId || !Number.isFinite(credits) || credits <= 0 || !reference) {
        console.warn('[webhook] Missing or invalid credit purchase metadata', { userId, credits, reference });
        return;
      }

      await this.applyPurchasedCredits(userId, credits, reference);
    } catch (error) {
      console.error('[webhook] Error processing Paystack webhook', error);
    }
  }

// After the success popup
  async verifyAndCredit(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError(401, 'User not authenticated');

      const { reference } = req.body as { reference: string };
      if (!reference) throw new AppError(400, 'Payment reference is required');

      // Verify with Paystack
      const verifyRes = await axios.get(`${PAYSTACK_VERIFY_URL}/${reference}`, {
        headers: { Authorization: `Bearer ${config.payment.paystack_api_key}` },
      });

      const txData = verifyRes.data?.data;

      if (!verifyRes.data?.status || txData?.status !== 'success') {
        throw new AppError(402, 'Payment has not been confirmed by Paystack');
      }

      const metadata = txData?.metadata ?? {};
      const metaUserId = Number(metadata.userId);
      const credits = Number(metadata.credits);

      if (metaUserId !== userId) {
        throw new AppError(403, 'Reference does not belong to this account');
      }

      if (!Number.isFinite(credits) || credits <= 0) {
        throw new AppError(400, 'Invalid credit amount in transaction metadata');
      }

      await this.applyPurchasedCredits(userId, credits, reference);

      const [wallet] = await db
        .select()
        .from(creditWallet)
        .where(eq(creditWallet.userId, userId));

      return res.status(200).json({
        success: true,
        message: 'Credits applied successfully',
        data: {
          totalCredit: wallet?.totalCredit ?? '0.00',
          creditUsed: wallet?.creditUsed ?? '0.00',
          creditLeft: wallet?.creditLeft ?? '0.00',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  //  Private helpers 
  private async applyPurchasedCredits(
    userId: number,
    credits: number,
    reference: string,
  ): Promise<void> {
    await db.transaction(async (tx) => {
        const [existing] = await tx
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.reference, reference));

      if (existing) {
        console.info(`[credits] Reference ${reference} already processed – skipping`);
        return;
      }

      //  Fetch or initialise wallet 
      const [wallet] = await tx
        .select()
        .from(creditWallet)
        .where(eq(creditWallet.userId, userId));

      const prevTotal = Number(wallet?.totalCredit ?? 0);
      // const prevUsed = Number(wallet?.creditUsed ?? 0);
      const prevLeft = Number(wallet?.creditLeft ?? 0);

      const newTotal = prevTotal + credits;
      const newLeft = prevLeft + credits;

      const now = formatDateForMySQL(new Date());

      if (!wallet) {
        await tx.insert(creditWallet).values({
          userId,
          totalCredit: newTotal.toFixed(2),
          creditUsed: (0).toFixed(2),
          creditLeft: newLeft.toFixed(2),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        } as typeof creditWallet.$inferInsert);
      } else {
        await tx
          .update(creditWallet)
          .set({
            totalCredit: newTotal.toFixed(2),
            creditLeft: newLeft.toFixed(2),
            updatedAt: now,
          })
          .where(eq(creditWallet.userId, userId));
      }

      //  No douuble crediting
      await tx.insert(creditTransactions).values({
        userId,
        reference,
        credits: credits.toFixed(2),
        type: 'purchase',
        createdAt: now,
      } as typeof creditTransactions.$inferInsert);
    });
  }

  async getCreditTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError(401, 'User not authenticated');

    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy((creditTransactions.createdAt))
      .limit(50);

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
}
}

export default new CreditController();