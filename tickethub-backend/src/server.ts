import app from '@/app.js';
import config from '@/config/config.js';
import logger from './utils/logger/index.js';
import { startCleanupJob } from './modules/auth/auth.cleanup.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, `Server listening`);
});

startCleanupJob();

const shutdown = (signal: string) => {
  logger.warn(`Received ${signal}. Shutting down gracefully…`);

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force-exit if the server hasn't closed within 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception – shutting down');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection – shutting down');
  process.exit(1);
});
