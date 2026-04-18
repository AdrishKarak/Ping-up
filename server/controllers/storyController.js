import fs from 'fs';
import Story from '../models/Story.js';
import User from '../models/User.js';
import { inngest } from '../inngest/index.js';
import imagekit from '../configs/imagekit.js';
import { toFile } from '@imagekit/nodejs';


//Add User Story
export const addStory = async (req, res) => {
    const media = req.file;

    try {
        const { userId } = await req.auth();
        const { content, media_type, background_color } = req.body;
        let media_url = ''

        if (!['text', 'image', 'video'].includes(media_type)) {
            return res.status(400).json({ success: false, message: "Invalid story type" });
        }

        if (media_type === 'text' && !content?.trim()) {
            return res.status(400).json({ success: false, message: "Story content is required" });
        }

        if ((media_type === 'image' || media_type === 'video') && !media) {
            return res.status(400).json({ success: false, message: "Story media is required" });
        }

        if (media_type === 'image' && !media.mimetype?.startsWith('image/')) {
            return res.status(400).json({ success: false, message: "Please upload an image file" });
        }

        if (media_type === 'video' && !media.mimetype?.startsWith('video/')) {
            return res.status(400).json({ success: false, message: "Please upload a video file" });
        }

        //Upload media to cloud
        if (media_type === 'image' || media_type === 'video') {
            const buffer = fs.readFileSync(media.path);
            const response = await imagekit.files.upload({
                file: await toFile(buffer, media.originalname),
                fileName: media.originalname,
                folder: "stories" // Use separate folder for stories
            })

            if (media_type === 'image') {
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
                })
            } else {
                // For video, do not apply image transformations
                media_url = response.url;
            }
        }

        if (media && media.path && fs.existsSync(media.path)) {
            fs.unlinkSync(media.path);
        }

        //Create Story
        const story = await Story.create({
            user: userId,
            content,
            media_type,
            background_color,
            media_urls: media_url ? [media_url] : []
        });

        //Schedule story deletion after 24 hours
        try {
            await inngest.send({
                name: 'app/story.delete',
                data: { storyId: story._id.toString() }
            })
        } catch (error) {
            console.warn('Failed to schedule story deletion', error.message);
        }

        return res.status(201).json({ success: true, message: "Story added successfully", story });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (media && media.path && fs.existsSync(media.path)) {
            fs.unlinkSync(media.path);
        }
    }
}

//Get User Story
export const getStories = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        //Get stories of user and their connections & followings
        const userIds = [userId, ...user.connections, ...user.following];
        const stories = await Story.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });


        return res.status(200).json({ success: true, stories });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
