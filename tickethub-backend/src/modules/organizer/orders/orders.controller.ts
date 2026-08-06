import type { Request, Response, NextFunction } from 'express';

import { getOrganizerOrders } from './orders.service.js';

export async function getOrders(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const orders = await getOrganizerOrders({
      organizerId: req.user.id,

      ...req.query,
    });

    res.status(200).json({
      success: true,

      data: orders,
    });
  } catch (error) {
    next(error);
  }
}
