import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const transport = isProduction
  ? undefined
  : pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
        ignore: 'pid,hostname',
        messageKey: 'msg',
        levelFirst: true,
      },
    });

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    base: {
      env: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label.toUpperCase() };
      },
    },
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', '*.password'],
      censor: '[REDACTED]',
    },
  },
  transport,
);

export default logger;