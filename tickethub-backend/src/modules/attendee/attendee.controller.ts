import type { Request, Response, NextFunction } from 'express';
import { getOrderFromReference } from './attendee.service.js';
import {
  getOrderHistory,
  getOrderHistoryDetail,
  type OrderHistoryPeriod,
} from './order-history.service.js';

export async function getAttendeeOrderHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderHistoryParams: {
      userId: number;
      page?: number;
      pageSize?: number;
      period?: OrderHistoryPeriod;
    } = { userId: req.user.id };

    if (req.query.page) orderHistoryParams.page = Number(req.query.page);
    if (req.query.pageSize) orderHistoryParams.pageSize = Number(req.query.pageSize);
    if (req.query.period) orderHistoryParams.period = req.query.period as OrderHistoryPeriod;

    const result = await getOrderHistory(orderHistoryParams);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAttendeeOrderHistoryDetail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getOrderHistoryDetail(req.user.id, Number(req.params.orderId));
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getAttendeeOrderFromReference(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await getOrderFromReference(req.query.reference as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

