import fs from "fs";
import imagekit from "../configs/imagekit.js";
import { toFile } from "@imagekit/nodejs";
import Post from "../models/Post.js";
import User from "../models/User.js";

//Add Post
export const addPost = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { content, post_type } = req.body;
        const images = req.files || [];

        let image_urls = [];

        if (images.length) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    try {
                        const buffer = fs.readFileSync(image.path);
                        const response = await imagekit.files.upload({
                            file: await toFile(buffer, image.originalname),
                            fileName: image.originalname,
                            folder: "posts"
                        })

                        return imagekit.helper.buildSrc({
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
                    } finally {
                        if (fs.existsSync(image.path)) {
                            fs.unlinkSync(image.path);
                        }
                    }
                })
            )
        }

        await Post.create({
            user: userId,
            content,
            post_type,
            image_urls
        })

        return res.status(200).json({ success: true, message: "Post created successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Get All Posts
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        //User Connections and followings posts
        const userIds = [userId, ...user.connections, ...user.following];
        const posts = await Post.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });
        return res.status(200).json({ success: true, posts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
