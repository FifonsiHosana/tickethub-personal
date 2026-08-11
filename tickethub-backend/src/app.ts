import express, { type Response } from 'express';

import morgan from 'morgan';
import logger from '@/utils/logger/index.js';
import { morganStream } from '@/utils/logger/stream.js';
import cors from 'cors';
import { errorHandler, notFoundHandler } from '@/middleware/errorHandler.js';

import authRoutes from '@/modules/auth/auth.routes.js';
import eventsRoutes from '@/modules/events/events.routes.js';
import ticketsRoutes from '@/modules/tickets/tickets.routes.js';
import financeRoutes from '@/modules/finance/finance.routes.js';
import organizerRoutes from '@/modules/organizer/organizer.routes.js';
import attendeeRoutes from '@/modules/attendee/attendee.routes.js';
import adminRoutes from '@/modules/admin/admin.routes.js';
import mediaRoutes from '@/modules/media/media.routes.js';
import settingsRoutes from '@/modules/settings/settings.routes.js';

const app = express();

app.use(express.json());
// favicon and public stuff latter

// HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';

app.use(morgan(morganFormat, { stream: morganStream }));

// CORS configuration would set it up better later
app.use(cors());

app.get('/', (_, res: Response) => {
  logger.info('Handling GET /');
  res.json({ message: 'Alaja Bla!' });
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/attendee', attendeeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/settings', settingsRoutes);

// error handling)

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
