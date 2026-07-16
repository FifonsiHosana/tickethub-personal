import type { Request, Response, NextFunction } from 'express';

import ticketsService from './tickets.service.js';

class TicketsController {
  async purchaseTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketsService.purchaseTickets(
        req.body,
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async checkInTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketsService.checkInTicket(
        req.body.ticketIdentifier,

        req.user.id,
      );

      return res.status(200).json({
        success: true,

        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new TicketsController();
