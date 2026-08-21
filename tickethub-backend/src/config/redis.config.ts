// redis.ts
import { createClient } from 'redis';

export const redisClient = createClient({
  url:
    process.env.REDIS_URL ||
    'redis://default:qbUBbWkgDTVOoGfa9XqUL1FEpBmfVTY9@fold-trackable-perceptive-77437.db.redis.io:10292',
  //change back to use ENV Variable
});

redisClient.on('error', (err: Error) => {
  console.error('Redis error:', err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}
