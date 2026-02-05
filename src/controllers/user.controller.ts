import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { logger } from '../config/logger';

export class UserController {
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      if (id === undefined) {
        sendError(res, 'User ID required', 400);
        return;
      }
      const userId = parseInt(id, 10);

      if (isNaN(userId)) {
        sendError(res, 'Invalid user ID', 400);
        return;
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        sendError(res, 'User not found', 404);
        return;
      }

      sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      logger.error('Get user error', error);
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      const { firstName, lastName, email } = req.body;
      const updatedUser = await userService.updateUser(req.user.userId, {
        firstName,
        lastName,
        email,
      });

      sendSuccess(res, updatedUser, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error', error);
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        sendError(res, 'User not authenticated', 401);
        return;
      }

      await userService.deleteUser(req.user.userId);
      sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error', error);
      next(error);
    }
  }
}

export const userController = new UserController();

