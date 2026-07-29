import type { Request, Response, NextFunction } from 'express';
import analyticsService from './analytics.service.js';

export async function overview(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await analyticsService.getOverview();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function revenueTrend(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await analyticsService.getRevenueTrend(from, to);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function userTrend(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await analyticsService.getUserTrend(from, to);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function eventStats(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await analyticsService.getEventStats();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function organizerPerformance(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await analyticsService.getOrganizerPerformance();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
