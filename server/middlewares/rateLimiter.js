import { rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient } from '../configs/redis.js';

export const rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    store: new RedisStore({
        sendCommand: (...args) => {
            if (redisClient.isReady) {
                return redisClient.sendCommand(args);
            }
            return Promise.resolve();
        },
    }),
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 10, // Limit each IP to 10 login requests per hour
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => {
            if (redisClient.isReady) {
                return redisClient.sendCommand(args);
            }
            return Promise.resolve();
        },
    }),
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again after an hour'
    }
});
