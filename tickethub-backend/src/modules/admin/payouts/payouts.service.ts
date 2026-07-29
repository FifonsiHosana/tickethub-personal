import axios from 'axios';
import { db } from '@/db/client.js';
import {
  payouts,
  organizerPayoutDetails,
  users,
} from '@/db/schema/index.js';
import { eq, count, desc } from 'drizzle-orm';
import config from '@/config/config.js';
import { AppError } from '@/middleware/errorHandler.js';
import { now } from '@/utils/timeDatehelpers.js';

export class PayoutsService {
  async list(page = 1, pageSize = 10) {
    const offset = (page - 1) * pageSize;

    const [totalResult] = await db
      .select({ count: count() })
      .from(payouts);

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
        page,
        pageSize,
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
      throw new AppError(
        400,
        'Organizer has no payout recipient. Set payout details first.',
      );
    }

    const response = await axios.post(
      'https://api.paystack.co/transfer',
      {
        source: 'balance',
        amount: Math.round(amount * 100),
        recipient: details.recipientCode,
        reason: 'TicketHub payout',
      },
      {
        headers: {
          Authorization: `Bearer ${config.payment.paystack_api_key}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const result = response.data;

    if (!result.status) {
      await db.insert(payouts).values({
        organizerId,
        amount: amount.toString(),
        commission: '0',
        processingFee: '0',
        reference: 'failed',
        status: 'Failed',
      });
      throw new AppError(502, 'Paystack transfer failed');
    }

    const [payout] = await db
      .insert(payouts)
      .values({
        organizerId,
        amount: amount.toString(),
        commission: '0',
        processingFee: '0',
        reference: result.data.reference as string,
        status: 'Completed',
        paidAt: now(),
      })
      .$returningId();

    return {
      message: 'Payout initiated successfully',
      payoutId: payout?.id,
      reference: result.data.reference,
    };
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
      type:
        details.payoutMethod === 'mobile_money'
          ? 'mobile_money'
          : 'nuban',
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

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transferrecipient',
      paystackPayload,
      {
        headers: {
          Authorization: `Bearer ${config.payment.paystack_api_key}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const recipientCode =
      paystackResponse.data?.data?.recipient_code as string;

    if (!recipientCode) {
      throw new AppError(502, 'Failed to create Paystack recipient');
    }

    const values = {
      ...details,
      recipientCode,
      updatedAt: now(),
    };

    const [existing] = await db
      .select({ id: organizerPayoutDetails.id })
      .from(organizerPayoutDetails)
      .where(eq(organizerPayoutDetails.organizerId, organizerId))
      .limit(1);

    if (existing) {
      await db
        .update(organizerPayoutDetails)
        .set(values)
        .where(eq(organizerPayoutDetails.id, existing.id));
    } else {
      await db
        .insert(organizerPayoutDetails)
        .values({ organizerId, ...values });
    }

    return {
      message: 'Payout details saved and Paystack recipient created',
    };
  }
}

export default new PayoutsService();
