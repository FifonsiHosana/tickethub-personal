import type { Request, Response, NextFunction } from 'express';
import payoutsService from './payouts.service.js';

export async function listPayouts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await payoutsService.list(page, pageSize);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function initiatePayout(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { organizerId, amount } = req.body;
    const result = await payoutsService.initiate(organizerId, amount);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function setPayoutDetails(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const organizerId = Number(req.params.id);
    const result = await payoutsService.setPayoutDetails(
      organizerId,
      req.body,
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
