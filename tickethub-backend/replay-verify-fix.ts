/* eslint-disable no-console */
import 'dotenv/config';
import { connectRedis } from '@/config/redis.config.js';
import {
  clearSession,
  getSession,
} from '@/modules/ussd/session.service.js';
import { handleUssd } from '@/modules/ussd/ussd.services.js';
import { tree } from '@/modules/ussd/menu-tree.js';

async function main() {
  // 1. Direct resolve checks: null-guard + index alignment + correct id stored
  const fakeContext: any = {
    eventDetails: {
      ticketTypes: [
        null,
        {
          id: 6,
          name: 'Early Bird',
          price: 500,
          remaining: 500,
          totalCount: 500,
          eventTicketId: 25,
        },
        {
          id: 9,
          name: 'Sold Out',
          price: 100,
          remaining: 0,
          totalCount: 100,
          eventTicketId: 99,
        },
      ],
    },
  };
  const resolve = tree.selectTicketType.resolve!;
  console.log('resolve "1" =>', await resolve('1', fakeContext));
  console.log('resolve "2" =>', await resolve('2', fakeContext));
  console.log('resolve "3" =>', await resolve('3', fakeContext));

  // 2. Live replay: dial -> confirm -> pick type, assert stored segment
  await connectRedis();
  const sessionId = `replay3-${Date.now()}`;
  const step = (text: string, first: boolean) =>
    handleUssd(sessionId, text, '233551234987', 'mtn', 'NALOTest', first);
  await step('*920*658*28#', true);
  await step('1', false);
  await step('1', false);
  const s = await getSession(sessionId);
  console.log('stored ticketType =>', s.data.ticketType);
  await clearSession(sessionId);
  process.exit(0);
}

main().catch((e) => {
  console.error('REPLAY FAILED:', e);
  process.exit(1);
});
