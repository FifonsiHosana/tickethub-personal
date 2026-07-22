import type { Request, Response, NextFunction } from 'express';
import { type RevenueTrendQuery, type PaginatedQuery } from './analytics.schema.js';
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
  const { from, to } = req.query;
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
  req: Request<{}, {}, {}, PaginatedQuery>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, pageSize, search } = req.query;

    const result = await getEventPerformance({
      organizerId: req.user.id,
      page,
      pageSize,
      search,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketPerformanceController(
  req: Request<{}, {}, {}, PaginatedQuery>,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, pageSize, search } = req.query;

    const result = await getTicketPerformance({
      organizerId: req.user.id,
      page,
      pageSize,
      search,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}
