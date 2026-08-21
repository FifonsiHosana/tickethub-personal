import type { Request, Response, NextFunction } from 'express';

import ticketsService from './tickets.service.js';

class TicketsController {
  async purchaseTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketsService.purchaseTickets(
        req.body,
        req.user?.id ?? null,
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTicketByIdentifier(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.params.ticketIdentifier as string;
      if (!identifier) {
        return res
          .status(400)
          .json({ success: false, message: 'Missing ticket identifier.' });
      }

      const ticket = await ticketsService.getTicketByIdentifier(identifier);

      if (!ticket) {
        return res
          .status(404)
          .json({ success: false, message: 'Ticket not found.' });
      }

      return res.json({ success: true, data: ticket });
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

  async resendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ticketsService.resendEmail(
        req.body.orderId,
        // req.user.id,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAtttendeesPhoneNumber(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const eventId = Number(req.params.eventId);

      if (isNaN(eventId)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid event ID' });
      }

      const rawGroupIds = req.query.groupIds;
      const groupIds = Array.isArray(rawGroupIds)
        ? rawGroupIds
            .flatMap((value) => String(value).split(','))
            .filter(Boolean)
            .map(Number)
        : typeof rawGroupIds === 'string'
          ? rawGroupIds.split(',').filter(Boolean).map(Number)
          : [];

      const phoneNumbers = await ticketsService.getAttendeePhoneNumbersByEvent(
        eventId,
        groupIds,
      );
      return res.json({ success: true, data: phoneNumbers });
    } catch (error) {
      next(error);
    }
  }
}

export default new TicketsController();
