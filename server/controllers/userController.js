import imagekit from "../configs/imagekit.js";
import { toFile } from "@imagekit/nodejs";
import User from "../models/User.js";
import Post from "../models/Post.js";
import Connection from "../models/Connection.js";
import { inngest } from "../inngest/index.js";
import fs from "fs";
import { redisClient } from "../configs/redis.js";

export const clearUserProfileCache = async (profileId) => {
    if (!redisClient.isReady) return;
    try {
        await Promise.all([
            redisClient.del(`profile:${profileId}`),
            redisClient.del(`user:${profileId}`)
        ]);
    } catch (err) {
        console.error("Cache clear error", err);
    }
};



//Get user data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();

        const cacheKey = `user:${userId}`;
        if (redisClient.isReady) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    const data = JSON.parse(cached);
                    data.user.isOnline = !!(await redisClient.get(`presence:${userId}`));
                    return res.status(200).json(data);
                }
            } catch (e) {
                console.error("Redis get error", e);
            }
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isOnline = redisClient.isReady ? !!(await redisClient.get(`presence:${userId}`)) : false;
        const userWithPresence = { ...user.toObject(), isOnline };
        const responseData = { success: true, user: userWithPresence };

        if (redisClient.isReady) {
            try {
                await redisClient.setEx(cacheKey, 600, JSON.stringify(responseData));
            } catch (e) {
                console.error("Redis set error", e);
            }
        }

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Update user data 
export const updateUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();
        let { username, bio, location, full_name } = req.body;
        const tempUser = await User.findById(userId);

        !username && (username = tempUser.username)

        if (tempUser.username !== username) {
            const user = await User.findOne({ username });
            if (user) {
                //we will not change the username
                username = tempUser.username;
            }
        }

        const updatedData = {
            username,
            bio,
            location,
            full_name
        }

        const profile = req.files?.profile?.[0];
        const cover = req.files?.cover?.[0];

        if (profile) {
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.files.upload({
                file: await toFile(buffer, profile.originalname),
                fileName: profile.originalname,
            })

            const url = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                    {
                        quality: 80,
                        format: 'webp',
                        width: 512
                    }
                ]
            })

            updatedData.profile_picture = url;
            fs.unlinkSync(profile.path);
        }

        if (cover) {
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.files.upload({
                file: await toFile(buffer, cover.originalname),
                fileName: cover.originalname,
            })

            const url = imagekit.helper.buildSrc({
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

            updatedData.cover_photo = url;
            fs.unlinkSync(cover.path);
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true });
        await clearUserProfileCache(userId);
        return res.status(200).json({ success: true, message: "User Profile updated successfully", user });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Find Users using username ,email , location , name
export const discoverUsers = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { input } = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    { username: new RegExp(input, 'i') },
                    { full_name: new RegExp(input, 'i') },
                    { email: new RegExp(input, 'i') },
                    { location: new RegExp(input, 'i') }
                ]
            }
        )

        const filteredUsers = allUsers.filter(user => user._id.toString() !== userId);
        return res.status(200).json({ success: true, users: filteredUsers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}


//Follow a User
export const followUser = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        if (user.following.includes(id)) {
            return res.json({ success: false, message: "You are already following this user" })
        }

        user.following.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        await clearUserProfileCache(userId);
        await clearUserProfileCache(id);

        return res.status(200).json({ success: true, message: "User followed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Unfollow User
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        user.following = user.following.filter(followingId => followingId !== id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(followerId => followerId !== userId);
        await toUser.save();

        await clearUserProfileCache(userId);
        await clearUserProfileCache(id);

        return res.status(200).json({ success: true, message: "User unfollowed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Send Connection Request
export const sendConnectionRequest = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.body;

        //Prevent self-connection
        if (userId === id) {
            return res.status(400).json({ success: false, message: "You cannot send a connection request to yourself" });
        }

        //Check if user has sent more than 20 connection requests in the last 24 hours
        const last24hrs = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find({ from_user_id: userId, createdAt: { $gt: last24hrs } })

        if (connectionRequests.length >= 20) {
            return res.status(400).json({ success: false, message: "You have sent more than 20 connection requests in the last 24 hours" });
        }

        //check if users already connected
        const connection = await Connection.findOne({
            $or: [
                { from_user_id: userId, to_user_id: id },
                { from_user_id: id, to_user_id: userId }
            ]
        })

        if (!connection) {
            const newConnection = await Connection.create({
                from_user_id: userId,
                to_user_id: id,
            })

            // Fire Inngest event to send email reminder
            await inngest.send({
                name: "app/connection-request",
                data: { connectionId: newConnection._id }
            });

            return res.status(200).json({ success: true, message: "Connection request sent successfully" });
        }

        if (connection.status === 'accepted') {
            return res.status(400).json({ success: false, message: "You are already connected with this user" });
        }

        return res.status(400).json({ success: false, message: "Connection request already sent and pending" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//Get USer Connections
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = await req.auth()
        const user = await User.findById(userId).populate('connections followers following')

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({ to_user_id: userId, status: 'pending' }).populate('from_user_id')).map(connection => connection.from_user_id)

        return res.status(200).json({ success: true, connections, followers, following, pendingConnections });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Accept Connection Request
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = await req.auth()
        const { id } = req.body

        const connection = await Connection.findOne({ from_user_id: id, to_user_id: userId })

        if (!connection) {
            return res.status(400).json({ success: false, message: "No connection request found" })
        }

        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save()

        const toUser = await User.findById(id);
        toUser.connections.push(userId);;
        await toUser.save();

        connection.status = 'accepted'
        await connection.save()

        await clearUserProfileCache(userId);
        await clearUserProfileCache(id);

        return res.status(200).json({ success: true, message: "Connection request accepted successfully" })
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Get User Profile
export const getUserProfile = async (req, res) => {
    try {
        const profileId = req.body?.profileId || req.query?.profileId;
        if (!profileId) {
            return res.status(400).json({ success: false, message: "Profile id is required" });
        }

        const cacheKey = `profile:${profileId}`;
        if (redisClient.isReady) {
            try {
                const cached = await redisClient.get(cacheKey);
                if (cached) {
                    const data = JSON.parse(cached);
                    data.profile.isOnline = !!(await redisClient.get(`presence:${profileId}`));
                    return res.status(200).json(data);
                }
            } catch (e) {
                console.error("Redis get error", e);
            }
        }

        const profile = await User.findById(profileId);

        if (!profile) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const posts = await Post.find({ user: profileId }).populate('user')
        const likedPosts = await Post.find({ likes_count: profileId }).populate('user')
        
        const isOnline = redisClient.isReady ? !!(await redisClient.get(`presence:${profileId}`)) : false;
        const profileWithPresence = { ...profile.toObject(), isOnline };
        const responseData = { success: true, profile: profileWithPresence, posts, likedPosts };

        if (redisClient.isReady) {
            try {
                await redisClient.setEx(cacheKey, 900, JSON.stringify(responseData));
            } catch (e) {
                console.error("Redis set error", e);
            }
        }

        return res.status(200).json(responseData);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}
