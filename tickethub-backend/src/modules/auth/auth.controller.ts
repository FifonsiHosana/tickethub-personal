import type { NextFunction, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegistrationService } from './services/auth.registration.service.js';
import { RoleUpgradeService } from './services/auth.role-upgrade.service.js';
import type {
  CreateLoginInput,
  CreateRegisterInput,
} from './auth.schema.js';

export class AuthController {
  private authService = new AuthService();
  private registrationService = new RegistrationService();
  private roleUpgradeService = new RoleUpgradeService();

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

  verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.authService.verifyOtp(
        req.body.email,
        req.body.otp,
      );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.authService.resendOtp(req.body.email);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  sendOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.registrationService.sendOtp(req.body);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  completeRegister = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const response = await this.registrationService.completeRegister(
        req.body,
      );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  becomeOrganizer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const response = await this.roleUpgradeService.becomeOrganizer(
        req.user.id,
      );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const response = await this.authService.forgotPassword(req.body.email);

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const response = await this.authService.resetPassword(
        req.body.token,
        req.body.password,
      );

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
