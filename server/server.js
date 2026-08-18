import express from "express";
import cors from 'cors';
import compression from 'compression';
import 'dotenv/config';
import connectDB from './shared/configs/db.js';
import { connectRedis } from './shared/configs/redis.js';
import { initMessagePubSub } from './modules/message/index.js';
import { inngest, functions } from './shared/inngest/index.js';
import { serve } from 'inngest/express';
import { clerkMiddleware } from '@clerk/express';
import { heartbeatMiddleware } from './shared/middlewares/heartbeat.js';
import userRouter from "./modules/user/index.js";
import postRouter from "./modules/post/index.js";
import storyRouter from "./modules/story/index.js";
import messageRouter from "./modules/message/index.js";
import commentRouter from "./modules/comment/index.js";

const app = express();

// Connect to DB and Redis in parallel
try {
    await Promise.all([
        connectDB(),
        connectRedis(),
        initMessagePubSub()
    ]);
    console.log("All connections established");
} catch (err) {
    console.error("Connection error during startup:", err);
    process.exit(1);
}

// Self-pinging mechanism to keep Render instance awake
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_EXTERNAL_URL) {
    setInterval(() => {
        fetch(`${RENDER_EXTERNAL_URL}/api/heartbeat`)
            .then(() => console.log('Self-ping successful'))
            .catch(err => console.error('Self-ping failed:', err));
    }, 14 * 60 * 1000); // Ping every 14 minutes
}

// Dynamic import to ensure rateLimiter is initialized after Redis connection
const { rateLimiter } = await import('./shared/middlewares/rateLimiter.js');

app.use(express.json());
app.use(compression());
app.use(cors());
app.use(clerkMiddleware());
app.use(heartbeatMiddleware);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/heartbeat', (req, res) => {
    res.status(200).json({ status: 'alive' });
});

app.use('/api/inngest', serve({ client: inngest, functions }));

app.use('/api/user', rateLimiter, userRouter);
app.use('/api/post', rateLimiter, postRouter);
app.use('/api/story', rateLimiter, storyRouter);
app.use('/api/message', rateLimiter, messageRouter);
app.use('/api/comment', rateLimiter, commentRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
