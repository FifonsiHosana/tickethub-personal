import type { Request, Response, NextFunction } from 'express';
import type {
  CreateTicketType,
  UpdateTicketType,
  CreateTicketTypeType,
  InvalidateTicketItemType,
  SwapTicketItemType,
} from './tickets.schema.js';
import * as TicketService from './tickets.service.js';
import {
  invalidateTicketItem,
  previewLegacyInvalidTickets,
  swapTicketItem,
} from './ticket-adjustments.service.js';

export async function getEventTickets(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const { eventId } = req.params;

  try {
    const data = await TicketService.getOrganizerEventTickets(
      req.user.id,
      // Number(eventId),
      eventId as string | number,
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
  const { ticketId } = req.params;
  try {
    const ticket = await TicketService.updateOrganizerTicket(
      req.user.id,
      Number(ticketId),
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

export async function listTicketTypes(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await TicketService.getTicketTypes();

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTicketType(
  req: Request<any, {}, CreateTicketTypeType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const type = await TicketService.createTicketType(req.body);

    res.status(201).json({
      success: true,
      message: 'Ticket type created successfully.',
      data: type,
    });
  } catch (error) {
    next(error);
  }
}

export async function previewInvalidTickets(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await previewLegacyInvalidTickets(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function invalidateIssuedTicket(
  req: Request<{ ticketIdentifier: string }, {}, InvalidateTicketItemType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await invalidateTicketItem({
      organizerId: req.user.id,
      actorId: req.user.id,
      ticketIdentifier: req.params.ticketIdentifier,
      reason: req.body.reason,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function swapIssuedTicket(
  req: Request<{ ticketIdentifier: string }, {}, SwapTicketItemType>,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await swapTicketItem({
      organizerId: req.user.id,
      actorId: req.user.id,
      ticketIdentifier: req.params.ticketIdentifier,
      targetEventTicketId: req.body.targetEventTicketId,
      reason: req.body.reason,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}