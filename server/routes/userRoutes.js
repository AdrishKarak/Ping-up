import express from "express";
import { discoverUsers, followUser, getUserData, unfollowUser, updateUserData, sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post('/update', upload.fields([{ name: 'profile', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), protect, updateUserData);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connection/send', protect, sendConnectionRequest);
userRouter.post('/connection/accept', protect, acceptConnectionRequest);
userRouter.post('/connection/reject', protect, rejectConnectionRequest);

export default userRouter;