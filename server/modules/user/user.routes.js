import express from "express";
import { discoverUsers, followUser, getUserData, unfollowUser, updateUserData, sendConnectionRequest, acceptConnectionRequest, getUserConnections, getUserProfile } from "./user.controller.js";
import { protect } from "../../shared/middlewares/auth.js";
import { upload } from "../../shared/configs/multer.js";
import { getUserRecentMessages } from "../message/message.controller.js";

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post('/update', upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), protect, updateUserData);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);
userRouter.get('/connections', protect, getUserConnections);
userRouter.post('/profiles', protect, getUserProfile);
userRouter.get('/profiles', protect, getUserProfile);
userRouter.get('/recent-messages', protect, getUserRecentMessages);

export default userRouter;
