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
    const { from, to } = req.query as { from?: string; to?: string };
    const analytics = await getOverviewAnalytics(req.user.id, { from, to });

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
  const { from, to, eventId, ticketId } = req.query as {
    from?: string;
    to?: string;
    eventId?: string;
    ticketId?: string;
  };
  try {
    const data = await getRevenueTrend(
      req.user.id,
      {
        from,
        to,
      },
      {
        eventId: eventId ? Number(eventId) : undefined,
        ticketId: ticketId ? Number(ticketId) : undefined,
      },
    );

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
    const { page, pageSize, search, from, to } = req.query;

    const result = await getEventPerformance({
      organizerId: req.user.id,
      page,
      pageSize,
      search,
      from,
      to,
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
    const { page, pageSize, search, from, to } = req.query;

    const result = await getTicketPerformance({
      organizerId: req.user.id,
      page,
      pageSize,
      search,
      from,
      to,
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
