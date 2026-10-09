import express, { type Response } from 'express';

import morgan from 'morgan';
import logger from '@/utils/logger/index.js';
import { morganStream } from '@/utils/logger/stream.js';
import cors, { type CorsOptions } from 'cors';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.js';
import { globalApiRateLimit } from '@/middleware/rateLimit.js';

import authRoutes from '@/modules/auth/auth.routes.js';
import eventsRoutes from '@/modules/events/events.routes.js';
import ticketsRoutes from '@/modules/tickets/tickets.routes.js';
import financeRoutes from '@/modules/finance/finance.routes.js';
import checkoutV2Routes from '@/modules/checkout-v2/checkout-v2.routes.js';
import organizerRoutes from '@/modules/organizer/organizer.routes.js';
import attendeeRoutes from '@/modules/attendee/attendee.routes.js';
import adminRoutes from '@/modules/admin/admin.routes.js';
import mediaRoutes from '@/modules/media/media.routes.js';
import settingsRoutes from '@/modules/settings/settings.routes.js';
import smsRoutes from '@/modules/sms/sms.routes.js';
import creditRoutes from '@/modules/credit/credit.routes.js';
import ussdRoutes from '@/modules/ussd/ussd.routes.js';
import ussdPaymentRoutes from '@/modules/ussd-payment/ussd-payment.routes.js';

const app = express();

const trustProxy = process.env.TRUST_PROXY ?? 'loopback';
app.set('trust proxy', trustProxy);

const webhookRawBody = express.raw({ type: 'application/json' });
app.use('/api/finance/webhook/paystack', webhookRawBody);
app.use('/api/organizer/credit/webhook/paystack', webhookRawBody);
app.use(express.json({ limit: '1mb' }));

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

app.use(morgan(morganFormat, { stream: morganStream }));

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_URL,
    process.env.VITE_DEV_CLIENT_SELF_URL,
    process.env.VITE_PROD_CLIENT_SELF_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ].filter((origin): origin is string => Boolean(origin)),
);

const corsOptions: CorsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
};

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(cors(corsOptions));
app.use('/api', globalApiRateLimit);

app.get('/', (_, res: Response) => {
  logger.info('Handling GET /');
  res.json({ message: 'Alaja Bla!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/v2/checkout', checkoutV2Routes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/attendee', attendeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/organizer/sms', smsRoutes);
app.use('/api/organizer/credit', creditRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/api/payweb', ussdPaymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
