import type { Request, Response, NextFunction } from 'express';

import {
  getOrganizerSales,
  getSaleById,
  getEventSales,
  getSalesSummary,
  getRevenueBreakdown,
  getTicketSalesBreakdown,
} from './sales.service.js';

export async function getSales(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sales = await getOrganizerSales({
      organizerId: req.user.id,

      ...req.query,
    });

    res.status(200).json({
      success: true,

      data: sales,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSaleDetails(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sale = await getSaleById(
      req.user.id,

      Number(req.params.orderId),
    );

    res.status(200).json({
      success: true,

      data: sale,
    });
  } catch (error) {
    next(error);
  }
}

export async function getEventSalesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const sales = await getEventSales(
      req.user.id,

      Number(req.params.eventId),
    );

    res.status(200).json({
      success: true,

      data: sales,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSalesSummaryController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const summary = await getSalesSummary(req.user.id, { from, to });

    res.status(200).json({
      success: true,

      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

export async function getRevenueController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const revenue = await getRevenueBreakdown(
      req.user.id,

      req.query.from as string,

      req.query.to as string,
    );

    res.status(200).json({
      success: true,

      data: revenue,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTicketSalesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const data = await getTicketSalesBreakdown(req.user.id, { from, to });

    res.status(200).json({
      success: true,

      data,
    });
  } catch (error) {
    next(error);
  }
}
