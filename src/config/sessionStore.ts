import session from 'express-session';
import { env } from './env';

// For production, you might want to use Redis or DynamoDB
// For now, using in-memory store (not suitable for production)
export const sessionConfig: session.SessionOptions = {
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict',
  },
  name: 'sessionId',
};

// TODO: Implement Redis or DynamoDB session store for production
// Example with Redis:
// import RedisStore from 'connect-redis';
// import { createClient } from 'redis';
// const redisClient = createClient({ url: process.env.REDIS_URL });
// redisClient.connect().catch(console.error);
// export const sessionConfig = {
//   ...baseConfig,
//   store: new RedisStore({ client: redisClient }),
// };

