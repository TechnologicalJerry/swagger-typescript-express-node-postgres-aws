import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sessionService } from '../services/session.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { decodeToken } from '../utils/jwt.util';
import { logger } from '../config/logger';

const getClientIp = (req: Request): string | undefined =>
  (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress;
const getUserAgent = (req: Request): string | undefined => req.headers['user-agent'];

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, confirmPassword, firstName, lastName, userName, gender, dob, phone } = req.body;

      // confirmPassword is validated in the validation middleware, but we don't pass it to the service
      const result = await userService.register({
        email,
        password,
        firstName,
        lastName,
        userName,
        gender,
        dob,
        phone,
      });

      await sessionService.createSession({
        userId: result.user.id,
        tokenId: result.jti,
        ip: getClientIp(req) ?? null,
        userAgent: getUserAgent(req) ?? null,
      });

      sendSuccess(res, { user: result.user, token: result.token }, 'User registered successfully', 201);
    } catch (error) {
      logger.error('Register error', error);
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await userService.login({ email, password });

      await sessionService.createSession({
        userId: result.user.id,
        tokenId: result.jti,
        ip: getClientIp(req) ?? null,
        userAgent: getUserAgent(req) ?? null,
      });

      sendSuccess(res, { user: result.user, token: result.token }, 'Login successful');
    } catch (error) {
      logger.error('Login error', error);
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
      if (!token) {
        sendSuccess(res, null, 'Logged out');
        return;
      }
      const payload = decodeToken(token);
      if (payload?.jti) {
        await sessionService.recordLogout(payload.jti);
      }
      sendSuccess(res, null, 'Logged out');
    } catch (error) {
      logger.error('Logout error', error);
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const user = await userService.getUserById(req.user.userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'Profile retrieved successfully');
    } catch (error) {
      logger.error('Get profile error', error);
      next(error);
    }
  }
}

export const authController = new AuthController();

