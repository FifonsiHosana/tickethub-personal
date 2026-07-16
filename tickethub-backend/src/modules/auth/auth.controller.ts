import type { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import type { CreateLoginInput, CreateRegisterInput } from './auth.schema.js';

export class AuthController {
  private authService = new AuthService();

  getUserRoles = async (_: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.authService.getUserRoles();

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  register = async (
    req: Request<{}, {}, CreateRegisterInput>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const response = await this.authService.register(req.body);

      return res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request<{}, {}, CreateLoginInput>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const response = await this.authService.login(req.body);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
