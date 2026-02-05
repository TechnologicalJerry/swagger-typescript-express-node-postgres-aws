import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: number;
  email: string;
  jti?: string; // token id - links to user_sessions.tokenId for login/logout tracking
}

export interface GenerateTokenOptions {
  jti?: string;
}

export const generateToken = (payload: Omit<TokenPayload, 'jti'>, options?: GenerateTokenOptions): string => {
  const signPayload = options?.jti ? { ...payload, jti: options.jti } : payload;
  return jwt.sign(signPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    ...(options?.jti && { jwtid: options.jti }),
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
};

