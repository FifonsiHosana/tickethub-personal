import type { Request, Response, NextFunction } from 'express';
import refundsService from './refunds.service.js';

export async function listRefunds(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const result = await refundsService.list(page, pageSize);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function pendingRefundRequests(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await refundsService.getPendingRequests();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function approveRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refundId = Number(req.params.id);
    const adminId = req.user.id;
    const result = await refundsService.approve(refundId, adminId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function rejectRefund(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const refundId = Number(req.params.id);
    const reason = req.body.reason as string;
    const result = await refundsService.reject(refundId, reason);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
