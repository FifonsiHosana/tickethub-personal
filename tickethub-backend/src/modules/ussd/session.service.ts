import { redisClient } from "@/config/redis.config.js";
import type { EventDetails } from "./ussd.types.js";


const TTL = 180;

export type Session = {
  stack: string[];
  data: Record<string, any>;
  eventDetails: EventDetails | undefined;
};

export const getSession = async (sessionId: string): Promise<Session> => {
  const raw = await redisClient.get(sessionId);
  console.log("currentsession", raw);

  return raw
    ? JSON.parse(raw)
    : { stack: ["root"], data: {}, eventDetails: undefined };
};

export const saveSession = async (sessionId: string, session: Session) => {
  await redisClient.set(sessionId, JSON.stringify(session), { EX: TTL });
};

export const clearSession = async (sessionId: string) => {
  await redisClient.del(sessionId);
};
