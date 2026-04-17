import fs from 'fs';
import Message from '../models/Message.js';
import imagekit from '../configs/imagekit.js';
import { toFile } from '@imagekit/nodejs';

//Create an empty object to store ss event Connections
const connectedClients = {};

//Controller function for the sse endpoint
export const sseController = (req, res) => {
    const { userId } = req.params;
    console.log('New client Connected', userId);

    //set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //Add the client's response object to the connection object
    connectedClients[userId] = res;

    //send an initial event to confirm connection
    res.write('data: {"type":"connected"}\n\n');

    //Handle client disconnection
    req.on('close', () => {
        //Remove the clients response object from the connections array
        delete connectedClients[userId];
        console.log('Client disconnected');
    });
}

//Function to send messages to users
export const sendMessage = async (req, res) => {
    const media = req.file;

    try {
        const { userId } = await req.auth();
        const { to_user_id, text, media_type } = req.body;
        let media_url = '';
        const message_type = media ? (media_type || (media.mimetype?.startsWith('image/') ? 'image' : '')) : 'text';

        if (!to_user_id) {
            return res.status(400).json({ success: false, message: "Receiver is required" });
        }

        if (!text?.trim() && !media) {
            return res.status(400).json({ success: false, message: "Message cannot be empty" });
        }

        //Upload media to cloud
        if (media) {
            if (message_type !== 'image' || !media.mimetype?.startsWith('image/')) {
                return res.status(400).json({ success: false, message: "Only image messages are supported" });
            }

            const buffer = fs.readFileSync(media.path);
            const response = await imagekit.files.upload({
                file: await toFile(buffer, media.originalname),
                fileName: media.originalname,
                folder: "messages"
            });

            media_url = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                    {
                        quality: 80,
                        format: 'webp',
                        width: 1280
                    }
                ]
            });
        }

        //Send messages
        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text: text?.trim() || '',
            message_type,
            media_url
        });

        //Send message to the receiver using SSE
        const messageWithUserData = await Message.findById(message._id).populate('from_user_id');

        if (connectedClients[to_user_id]) {
            connectedClients[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`);
        }

        return res.status(201).json({ success: true, message });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (media && media.path && fs.existsSync(media.path)) {
            fs.unlinkSync(media.path);
        }
    }
}

export const getMessages = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { to_user_id } = req.body;
        const messages = await Message.find({
            $or: [
                { from_user_id: userId, to_user_id },
                { from_user_id: to_user_id, to_user_id: userId }
            ]
        }).sort({ createdAt: -1 }).populate('from_user_id');

        //Mark messages as read
        await Message.updateMany(
            { from_user_id: to_user_id, to_user_id: userId },
            { seen: true }
        );
        return res.status(200).json({ success: true, messages });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Recent messages
export const getUserRecentMessages = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const messages = await Message.find({ to_user_id: userId }).populate('from_user_id to_user_id').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, messages });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
