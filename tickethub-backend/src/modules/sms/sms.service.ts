import axios from 'axios';
import config from '@/config/config.js';
import { db } from '@/db/client.js';
import { smsHistory, creditWallet } from '@/db/schema/index.js';
import { eq, sql } from 'drizzle-orm';

export class SmsService {
  async getBalance(userId: number) {
    const [wallet] = await db
      .select()
      .from(creditWallet)
      .where(eq(creditWallet.userId, userId));

    return wallet;
  }

  async getHistory(userId: number) {
    const history = await db
      .select()
      .from(smsHistory)
      .where(eq(smsHistory.userId, userId))
      .orderBy(smsHistory.createdAt);

    return history;
  }

  async sendSms(userId: number){
    
  }
}
