import { type StreamOptions } from 'morgan';
import logger from './index.js';

/**
 * Creates a Morgan-compatible stream that pipes HTTP logs through Pino.
 * Morgan writes a single string per request; we forward it as a structured
 * log entry so everything ends up in one unified log pipeline.
 */
export const morganStream: StreamOptions = {
  write(message: string) {
    // Morgan appends a trailing newline — strip it before logging
    logger.info({ source: 'http' }, message.trimEnd());
  },
};
