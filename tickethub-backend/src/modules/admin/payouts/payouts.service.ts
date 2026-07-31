import { db } from '@/db/client.js';
import {
  payouts,
  organizerPayoutDetails,
  users,
} from '@/db/schema/index.js';
import { eq, count, desc } from 'drizzle-orm';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';
import { getSetting, callPaystackTransfer, createPaystackRecipient } from './payouts.utils.js';

export class PayoutsService {
  async getDetails(organizerId: number) {
    const [details] = await db
      .select()
      .from(organizerPayoutDetails)
      .where(eq(organizerPayoutDetails.organizerId, organizerId))
      .limit(1);
    return details ?? null;
  }

  async list(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;
    const [totalResult] = await db.select({ count: count() }).from(payouts);
    const data = await db
      .select({
        id: payouts.id,
        organizerId: payouts.organizerId,
        amount: payouts.amount,
        commission: payouts.commission,
        processingFee: payouts.processingFee,
        reference: payouts.reference,
        status: payouts.status,
        paidAt: payouts.paidAt,
        organizerFirstName: users.firstName,
        organizerLastName: users.lastName,
        organizerEmail: users.email,
      })
      .from(payouts)
      .leftJoin(users, eq(payouts.organizerId, users.id))
      .orderBy(desc(payouts.paidAt))
      .limit(pageSize)
      .offset(offset);
    return {
      data,
      pagination: {
        page, pageSize,
        total: Number(totalResult?.count ?? 0),
        totalPages: Math.ceil(Number(totalResult?.count ?? 0) / pageSize),
      },
    };
  }

  async initiate(organizerId: number, amount: number) {
    const [details] = await db
      .select()
      .from(organizerPayoutDetails)
      .where(eq(organizerPayoutDetails.organizerId, organizerId))
      .limit(1);

    if (!details?.recipientCode) {
      throw new AppError(400, 'Organizer has no payout recipient. Set payout details first.');
    }

    const commissionRate = Number(await getSetting('commission_rate')) || 5;
    const processingFee = Number(await getSetting('processing_fee')) || 1.5;
    const commission = Math.round((amount * commissionRate) / 100 * 100) / 100;
    const netAmount = amount - commission - processingFee;

    const result = await callPaystackTransfer(
      details.recipientCode,
      Math.round(netAmount * 100),
      'TicketHub payout',
    );

    if (!result.status) {
      await db.insert(payouts).values({
        organizerId, amount: amount.toString(), commission: commission.toString(),
        processingFee: processingFee.toString(), reference: 'failed', status: 'Failed',
      });
      throw new AppError(502, 'Paystack transfer failed');
    }

    const [payout] = await db
      .insert(payouts)
      .values({
        organizerId, amount: amount.toString(), commission: commission.toString(),
        processingFee: processingFee.toString(),
        reference: result.data.reference as string,
        status: 'Pending',
      })
      .$returningId();

    return {
      message: 'Payout initiated (pending Paystack processing)',
      payoutId: payout?.id,
      reference: result.data.reference,
    };
  }

  async handleTransferWebhook(payload: any) {
    const event = payload.event;
    if (event !== 'transfer.success' && event !== 'transfer.failed') return;

    const ref = payload.data.reference;
    const [payout] = await db
      .select({ id: payouts.id, status: payouts.status })
      .from(payouts)
      .where(eq(payouts.reference, ref))
      .limit(1);

    if (!payout) return;

    if (event === 'transfer.success') {
      await db
        .update(payouts)
        .set({ status: 'Completed', paidAt: now() })
        .where(eq(payouts.id, payout.id));
    } else {
      await db
        .update(payouts)
        .set({ status: 'Failed' })
        .where(eq(payouts.id, payout.id));
    }
  }

  async setPayoutDetails(
    organizerId: number,
    details: {
      payoutMethod: 'bank' | 'mobile_money';
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      mobileMoneyProvider?: string;
      mobileMoneyNumber?: string;
      mobileMoneyName?: string;
    },
  ) {
    const paystackPayload: Record<string, string> = {
      type: details.payoutMethod === 'mobile_money' ? 'mobile_money' : 'ghipss',
      currency: 'GHS',
    };

    if (details.payoutMethod === 'bank') {
      paystackPayload.name = details.accountName!;
      paystackPayload.account_number = details.accountNumber!;
      paystackPayload.bank_code = details.bankName!;
    } else {
      paystackPayload.name = details.mobileMoneyName!;
      paystackPayload.account_number = details.mobileMoneyNumber!;
      paystackPayload.bank_code = details.mobileMoneyProvider!;
    }

    const recipientCode = await createPaystackRecipient(paystackPayload);
    const values = { ...details, recipientCode, updatedAt: now() };
    const [existing] = await db
      .select({ id: organizerPayoutDetails.id })
      .from(organizerPayoutDetails)
      .where(eq(organizerPayoutDetails.organizerId, organizerId))
      .limit(1);

    if (existing) {
      await db.update(organizerPayoutDetails).set(values).where(eq(organizerPayoutDetails.id, existing.id));
    } else {
      await db.insert(organizerPayoutDetails).values({ organizerId, ...values });
    }

    return { message: 'Payout details saved and Paystack recipient created' };
  }
}

export default new PayoutsService();
