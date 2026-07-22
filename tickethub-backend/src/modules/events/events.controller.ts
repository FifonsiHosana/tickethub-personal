import type { NextFunction, Request, Response } from 'express';

import eventsService from './events.service.js';
import { AppError } from '@/middleware/errorHandler.js';
import type { GetPublishedEventsQuery } from './events.schema.js';

class EventsController {
  async getPublishedEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as GetPublishedEventsQuery;
      const result = await eventsService.getPublishedEvents(query);

      return res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventsService.getEventById(Number(req.params.id));

      if (!event) {
        throw new AppError(404, 'Event not found');
      }
      return res.json({ success: true, data: event });
    } catch (error) {
      next(error);
    }
  }

  async getEventTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await eventsService.getEventTickets(
        Number(req.params.id),
      );

      return res.json({ success: true, data: tickets });
    } catch (error) {
      next(error);
    }
  }
}

export default new EventsController();
