import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.STREAM_API_KEY;
const secret = process.env.STREAM_SECRET;

const streamClient = apiKey && secret ? new StreamClient(apiKey, secret) : null;

export const getStreamClient = () => {
    if (!streamClient) {
        throw new Error("Stream credentials are not configured");
    }

    return streamClient;
};

export const getStreamApiKey = () => {
    if (!apiKey) {
        throw new Error("Stream API key is not configured");
    }

    return apiKey;
};
