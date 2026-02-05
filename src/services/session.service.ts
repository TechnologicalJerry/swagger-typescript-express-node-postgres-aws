import { Session, SessionCreationAttributes } from '../models/session.model';
import { logger } from '../config/logger';

export interface CreateSessionData {
  userId: number;
  tokenId: string;
  ip?: string | null;
  userAgent?: string | null;
}

export class SessionService {
  async createSession(data: CreateSessionData): Promise<Session> {
    try {
      const sessionData: SessionCreationAttributes = {
        userId: data.userId,
        tokenId: data.tokenId,
        status: 'active',
        loginAt: new Date(),
        ip: data.ip ?? null,
        userAgent: data.userAgent ?? null,
      };
      const session = await Session.create(sessionData);
      return session;
    } catch (error) {
      logger.error('Error creating session', error);
      throw error;
    }
  }

  async recordLogout(tokenId: string): Promise<Session | null> {
    try {
      const session = await Session.findOne({
        where: { tokenId, status: 'active' },
      });
      if (!session) {
        return null;
      }
      await session.update({
        status: 'logged_out',
        logoutAt: new Date(),
      });
      return session;
    } catch (error) {
      logger.error('Error recording logout', error);
      throw error;
    }
  }

  async getActiveSessionsByUserId(userId: number): Promise<Session[]> {
    try {
      return Session.findAll({
        where: { userId, status: 'active' },
        order: [['loginAt', 'DESC']],
      });
    } catch (error) {
      logger.error('Error getting active sessions', error);
      throw error;
    }
  }

  async getSessionsByUserId(userId: number, limit = 50): Promise<Session[]> {
    try {
      return Session.findAll({
        where: { userId },
        order: [['loginAt', 'DESC']],
        limit,
      });
    } catch (error) {
      logger.error('Error getting user sessions', error);
      throw error;
    }
  }
}

export const sessionService = new SessionService();
