import imagekit from "../configs/imagekit.js";
import { toFile } from "@imagekit/nodejs";
import User from "../models/User.js";
import fs from "fs";



//Get user data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Update user data 
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth();
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

        await User.findByIdAndUpdate(userId, updatedData, { new: true });
        return res.status(200).json({ success: true, message: "User Profile updated successfully" });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Find Users using username ,email , location , name
export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth();
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
        const { userId } = req.auth();
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

        return res.status(200).json({ success: true, message: "User followed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

//Unfollow User
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const user = await User.findById(userId);

        user.following = user.following.filter(followingId => followingId !== id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(followerId => followerId !== userId);
        await toUser.save();

        return res.status(200).json({ success: true, message: "User unfollowed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}