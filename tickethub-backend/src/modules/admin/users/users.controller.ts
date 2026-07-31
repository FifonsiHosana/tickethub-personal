import type { Request, Response, NextFunction } from 'express';
import usersService from './users.service.js';

export async function listUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await usersService.list(req.query as any);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.id);
    const data = await usersService.getById(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function suspendUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.id);
    const { isActive } = req.body;
    const result = await usersService.suspend(userId, isActive);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function verifyOrganizer(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.id);
    const result = await usersService.verifyOrganizer(userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function resetUserPassword(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body;
    const result = await usersService.resetPassword(userId, newPassword);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function listOrganizers(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await usersService.listOrganizers();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function verificationQueue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await usersService.verificationQueue(req.query as any);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
