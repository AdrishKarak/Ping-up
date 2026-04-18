import { redisClient } from '../configs/redis.js';

export const heartbeatMiddleware = async (req, res, next) => {
    if (req.auth && redisClient.isReady) {
        try {
            const { userId } = await req.auth();
            if (userId) {
                // Set user presence in Redis with a 5-minute TTL
                await redisClient.setEx(`presence:${userId}`, 300, 'online');
            }
        } catch (err) {
            // Silently fail if auth fails during heartbeat
        }
    }
    next();
};
