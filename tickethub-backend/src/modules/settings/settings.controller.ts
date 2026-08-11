import type { Request, Response, NextFunction } from 'express';
import settingsService from './settings.service.js';

export async function getPublicSettings(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = await settingsService.getPublic();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}