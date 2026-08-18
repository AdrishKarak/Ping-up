import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    console.error('REDIS_URL environment variable is missing.');
}

const redisClient = createClient({
    url: redisUrl
});

const pubClient = redisClient.duplicate();
const subClient = redisClient.duplicate();

redisClient.on('error', (err) => console.log('Redis Client Error', err));
pubClient.on('error', (err) => console.log('Redis PubClient Error', err));
subClient.on('error', (err) => console.log('Redis SubClient Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        await pubClient.connect();
        await subClient.connect();
        console.log('Redis instances connected successfully');
    } catch (err) {
        console.error('Failed to connect to Redis instances:', err);
    }
};

export { redisClient, pubClient, subClient };
