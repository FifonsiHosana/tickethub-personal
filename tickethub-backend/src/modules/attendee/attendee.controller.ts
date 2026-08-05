import type { Request, Response, NextFunction } from 'express';

import { getOrderHistory } from './attendee.service.js';

export async function getAttendeeOrderHistory(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orderHistoryParams: {
      page?: number;
      pageSize?: number;
    } = {};

    if (req.query.page) {
      orderHistoryParams.page = Number(req.query.page);
    }
    if (req.query.pageSize) {
      orderHistoryParams.pageSize = Number(req.query.pageSize);
    }

    const result = await getOrderHistory({
      userId: req.user.id,
      ...orderHistoryParams,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
