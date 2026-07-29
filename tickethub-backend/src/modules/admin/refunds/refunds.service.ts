import axios from 'axios';
import { db } from '@/db/client.js';
import { refunds, payments } from '@/db/schema/index.js';
import { eq, count, desc } from 'drizzle-orm';
import config from '@/config/config.js';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';

export class RefundsService {
  async list(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const [totalResult] = await db
      .select({ count: count() })
      .from(refunds);

    const data = await db
      .select({
        id: refunds.id,
        paymentId: refunds.paymentId,
        amount: refunds.amount,
        reason: refunds.reason,
        status: refunds.status,
        rejectionReason: refunds.rejectionReason,
        requestedAt: refunds.requestedAt,
        approvedAt: refunds.approvedAt,
      })
      .from(refunds)
      .orderBy(desc(refunds.requestedAt))
      .limit(pageSize)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: Number(totalResult?.count ?? 0),
        totalPages: Math.ceil(Number(totalResult?.count ?? 0) / pageSize),
      },
    };
  }

  async getPendingRequests() {
    const data = await db
      .select()
      .from(refunds)
      .where(eq(refunds.status, 'Pending'))
      .orderBy(desc(refunds.requestedAt));

    return { data };
  }

  async approve(refundId: number, adminId: number) {
    const [refund] = await db
      .select({
        id: refunds.id,
        status: refunds.status,
        paymentId: refunds.paymentId,
        amount: refunds.amount,
      })
      .from(refunds)
      .where(eq(refunds.id, refundId))
      .limit(1);

    if (!refund) throw new AppError(404, 'Refund not found');
    if (refund.status !== 'Pending') {
      throw new AppError(400, 'Only pending refunds can be approved');
    }

    if (!refund.paymentId) {
      throw new AppError(400, 'Refund has no associated payment');
    }

    const [payment] = await db
      .select({ reference: payments.reference })
      .from(payments)
      .where(eq(payments.id, refund.paymentId))
      .limit(1);

    if (!payment) throw new AppError(404, 'Payment not found');

    const amountInPesewas = Math.round(Number(refund.amount) * 100);

    try {
      await axios.post(
        'https://api.paystack.co/refund',
        {
          transaction: payment.reference,
          amount: amountInPesewas,
        },
        {
          headers: {
            Authorization: `Bearer ${config.payment.paystack_api_key}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch {
      throw new AppError(502, 'Paystack refund failed');
    }

    await db
      .update(refunds)
      .set({
        status: 'Completed',
        approvedAt: now(),
        approvedBy: adminId,
      })
      .where(eq(refunds.id, refundId));

    return { message: 'Refund approved and processed' };
  }

  async reject(refundId: number, reason: string) {
    const [refund] = await db
      .select({ id: refunds.id, status: refunds.status })
      .from(refunds)
      .where(eq(refunds.id, refundId))
      .limit(1);

    if (!refund) throw new AppError(404, 'Refund not found');
    if (refund.status !== 'Pending') {
      throw new AppError(400, 'Only pending refunds can be rejected');
    }

    await db
      .update(refunds)
      .set({ status: 'Rejected', rejectionReason: reason })
      .where(eq(refunds.id, refundId));

    return { message: 'Refund rejected' };
  }
}

export default new RefundsService();
