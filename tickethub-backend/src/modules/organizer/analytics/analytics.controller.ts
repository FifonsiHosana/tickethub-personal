import type { Request, Response, NextFunction } from 'express';
import { type RevenueTrendQuery } from './analytics.schema.js';
import {
  getOverviewAnalytics,
  getRevenueTrend,
  getEventPerformance,
  getTicketPerformance,
} from './analytics.service.js';

export async function getOverviewAnalyticsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const analytics = await getOverviewAnalytics(req.user.id);

    res.status(200).json({
      success: true,

      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRevenueTrendController(
  req: Request<{}, {}, {}, RevenueTrendQuery>,
  res: Response,
  next: NextFunction,
) {
  const { from, to } = req.query.query;
  try {
    const data = await getRevenueTrend(req.user.id, {
      from,
      to,
    });

    res.status(200).json({
      success: true,

      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventPerformanceController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getEventPerformance(req.user.id);

    res.status(200).json({
      success: true,

      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketPerformanceController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await getTicketPerformance(req.user.id);

    res.status(200).json({
      success: true,

      data,
    });
  } catch (error) {
    next(error);
  }
}
