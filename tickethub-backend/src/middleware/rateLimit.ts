import type { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

const DEFAULT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_MAX_REQUESTS = 300;
const CHECKOUT_WINDOW_MS = 15 * 60 * 1000;
const CHECKOUT_MAX_ATTEMPTS = 5;
const BAN_HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;
const BAN_LEVEL_1_MS = 30 * 60 * 1000;
const BAN_LEVEL_2_MS = 2 * 60 * 60 * 1000;
const BAN_LEVEL_3_MS = 24 * 60 * 60 * 1000;

type CheckoutRateEntry = {
  count: number;
  windowStart: number;
  banUntil: number;
  violations: number;
  violationWindowStart: number;
};

const checkoutAttempts = new Map<string, CheckoutRateEntry>();

function readPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clientKey(req: Request) {
  const userId = req.user?.id;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  return userId ? `user:${userId}:ip:${ip}` : `ip:${ip}`;
}

function checkoutBanDuration(violations: number) {
  if (violations <= 1) {
    return readPositiveNumber(
      process.env.CHECKOUT_BAN_LEVEL_1_MS,
      BAN_LEVEL_1_MS,
    );
  }
  if (violations === 2) {
    return readPositiveNumber(
      process.env.CHECKOUT_BAN_LEVEL_2_MS,
      BAN_LEVEL_2_MS,
    );
  }
  return readPositiveNumber(
    process.env.CHECKOUT_BAN_LEVEL_3_MS,
    BAN_LEVEL_3_MS,
  );
}

function rejectCheckout(res: Response) {
  return res.status(429).json({
    success: false,
    message: 'Too many checkout attempts. Please try again later.',
  });
}

const skippedPaths = new Set([
  '/finance/webhook/paystack',
  '/organizer/credit/webhook/paystack',
]);

export const globalApiRateLimit = rateLimit({
  windowMs: readPositiveNumber(
    process.env.GLOBAL_RATE_LIMIT_WINDOW_MS,
    DEFAULT_WINDOW_MS,
  ),
  limit: readPositiveNumber(
    process.env.GLOBAL_RATE_LIMIT_MAX,
    DEFAULT_MAX_REQUESTS,
  ),
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) =>
    skippedPaths.has(req.path) ||
    req.path === '/ussd' ||
    req.path.startsWith('/ussd/') ||
    req.path.startsWith('/payweb/'),
  handler: (_req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

export function checkoutAttemptLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const now = Date.now();
  const key = clientKey(req);
  const windowMs = readPositiveNumber(
    process.env.CHECKOUT_ATTEMPT_WINDOW_MS,
    CHECKOUT_WINDOW_MS,
  );
  const maxAttempts = readPositiveNumber(
    process.env.CHECKOUT_ATTEMPT_MAX,
    CHECKOUT_MAX_ATTEMPTS,
  );

  const current = checkoutAttempts.get(key);

  if (!current || now - current.windowStart > windowMs) {
    const violations =
      current && now - current.violationWindowStart <= BAN_HISTORY_WINDOW_MS
        ? current.violations
        : 0;
    const violationWindowStart = violations
      ? current!.violationWindowStart
      : now;
    checkoutAttempts.set(key, {
      count: 1,
      windowStart: now,
      banUntil:
        current?.banUntil && current.banUntil > now ? current.banUntil : 0,
      violations,
      violationWindowStart,
    });

    const entry = checkoutAttempts.get(key)!;
    if (entry.banUntil > now) return rejectCheckout(res);
    return next();
  }

  if (current.banUntil > now) return rejectCheckout(res);

  current.count += 1;

  if (current.count > maxAttempts) {
    if (now - current.violationWindowStart > BAN_HISTORY_WINDOW_MS) {
      current.violations = 0;
      current.violationWindowStart = now;
    }

    current.violations += 1;
    current.banUntil = now + checkoutBanDuration(current.violations);
    return rejectCheckout(res);
  }

  return next();
}
