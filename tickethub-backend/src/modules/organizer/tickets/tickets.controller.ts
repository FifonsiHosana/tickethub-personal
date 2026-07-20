import type { Request, Response, NextFunction } from 'express';
import type { CreateTicketType, UpdateTicketType } from './tickets.schema.js';
import * as TicketService from './tickets.service.js';

export async function getEventTickets(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { eventId } = req.params;

  try {
    const data = await TicketService.getOrganizerEventTickets(
      req.user.id,
      Number(eventId),
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTicket(
  req: Request<any, {}, CreateTicketType>,
  res: Response,
  next: NextFunction,
) {
  const { eventId } = req.params;
  try {
    const ticket = await TicketService.createOrganizerTicket(
      req.user.id,
      Number(eventId),
      req.body,
    );

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(
  req: Request<any, {}, UpdateTicketType>,
  res: Response,
  next: NextFunction,
) {
  const { eventId } = req.params;
  try {
    const ticket = await TicketService.updateOrganizerTicket(
      req.user.id,
      Number(eventId),
      req.body,
    );

    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully.',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await TicketService.deleteOrganizerTicket(
      req.user.id,
      Number(req.params.ticketId),
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
