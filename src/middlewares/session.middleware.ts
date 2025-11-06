import session from 'express-session';
import { sessionConfig } from '../config/sessionStore';

export const sessionMiddleware = session(sessionConfig);

