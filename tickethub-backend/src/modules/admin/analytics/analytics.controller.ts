import type { Request, Response, NextFunction } from 'express';
import analyticsService from './analytics.service.js';
import {
  getCompletedOrdersForExport,
  listCompletedOrders,
} from './completed-orders.service.js';
import {
  generateCompletedOrdersExcel,
  generateCompletedOrdersPdf,
} from './completed-orders.export.js';

export async function overview(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await analyticsService.getOverview({ from, to });
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

export async function completedOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { page, pageSize, search, from, to } = req.query as {
      page?: string;
      pageSize?: string;
      search?: string;
      from?: string;
      to?: string;
    };
    const data = await listCompletedOrders({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search,
      from,
      to,
    });
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function exportCompletedOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { format, search, from, to } = req.query as {
      format?: 'excel' | 'pdf';
      search?: string;
      from?: string;
      to?: string;
    };
    const rows = await getCompletedOrdersForExport({ search, from, to });
    const isPdf = format === 'pdf';
    const buffer = isPdf
      ? await generateCompletedOrdersPdf(rows)
      : await generateCompletedOrdersExcel(rows);

    res.setHeader(
      'Content-Type',
      isPdf
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="completed-orders.${isPdf ? 'pdf' : 'xlsx'}"`,
    );
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
}

