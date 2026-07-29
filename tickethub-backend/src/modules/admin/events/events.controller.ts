import type { Request, Response, NextFunction } from 'express';
import eventsService from './events.service.js';

export async function listEvents(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await eventsService.list(req.query as any);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getEventDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.id);
    const data = await eventsService.getDetail(eventId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function approveEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.id);
    const adminId = req.user.id;
    const result = await eventsService.approve(eventId, adminId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function rejectEvent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const eventId = Number(req.params.id);
    const { reason } = req.body;
    const result = await eventsService.reject(eventId, reason);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
