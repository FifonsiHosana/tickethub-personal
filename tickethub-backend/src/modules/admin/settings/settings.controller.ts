import type { Request, Response, NextFunction } from 'express';
import settingsService from './settings.service.js';

export async function getSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await settingsService.getAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const adminId = req.user.id;
    const data = await settingsService.update(req.body, adminId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}
