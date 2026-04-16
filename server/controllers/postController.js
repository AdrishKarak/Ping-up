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

        if (images.length > 4) {
            images.forEach((image) => {
                if (fs.existsSync(image.path)) {
                    fs.unlinkSync(image.path);
                }
            });

            return res.status(400).json({ success: false, message: "You can upload up to 4 images only" });
        }

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
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Prioritize user's own, connections', and following posts, then show everyone else.
        const priorityUserIds = [...new Set([userId, ...user.connections, ...user.following])];
        const [priorityPostsCount, totalPostsCount] = await Promise.all([
            Post.countDocuments({ user: { $in: priorityUserIds } }),
            Post.countDocuments()
        ]);

        let priorityPosts = [];
        let otherPosts = [];

        if (skip < priorityPostsCount) {
            priorityPosts = await Post.find({ user: { $in: priorityUserIds } })
                .populate('user')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const remainingLimit = limit - priorityPosts.length;

            if (remainingLimit > 0) {
                otherPosts = await Post.find({ user: { $nin: priorityUserIds } })
                    .populate('user')
                    .sort({ createdAt: -1 })
                    .limit(remainingLimit);
            }
        } else {
            otherPosts = await Post.find({ user: { $nin: priorityUserIds } })
                .populate('user')
                .sort({ createdAt: -1 })
                .skip(skip - priorityPostsCount)
                .limit(limit);
        }

        const posts = [...priorityPosts, ...otherPosts];
        const hasMore = skip + posts.length < totalPostsCount;

        return res.status(200).json({ success: true, posts, page, limit, hasMore });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Like Post
export const likePost = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { postId } = req.body;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save();
            return res.status(200).json({ success: true, message: "Post unliked successfully" });
        } else {
            post.likes_count.push(userId);
            await post.save();
            return res.status(200).json({ success: true, message: "Post liked successfully" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
