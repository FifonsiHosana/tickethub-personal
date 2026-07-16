import type { NextFunction, Request, Response } from 'express';

import eventsService from './events.service.js';
import { AppError } from '@/middleware/errorHandler.js';

class EventsController {
  async getPublishedEvents(_: Request, res: Response, next: NextFunction) {
    try {
      const events = await eventsService.getPublishedEvents();

      return res.json(events);
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
      return res.json(event);
    } catch (error) {
      next(error);
    }
  }

  async getEventTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await eventsService.getEventTickets(
        Number(req.params.id),
      );

      return res.json(tickets);
    } catch (error) {
      next(error);
    }
  }
}

export default new EventsController();
