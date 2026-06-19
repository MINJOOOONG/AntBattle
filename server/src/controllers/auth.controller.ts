import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, nickname, handle, password } = req.body;
      const result = await authService.signup({ email, nickname, handle, password });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { handle, password } = req.body;
      const result = await authService.login({ handle, password });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const result = await authService.getMe(userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();
