import express from "express";
import multer from "multer";
import { addPost, getFeedPosts, likePost } from "../controllers/postController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../configs/multer.js";

const postRouter = express.Router();

const uploadPostImages = (req, res, next) => {
    upload.array('images', 4)(req, res, (error) => {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ success: false, message: "You can upload up to 4 images only" });
        }

        if (error) {
            return res.status(400).json({ success: false, message: error.message });
        }

        next();
    });
}

postRouter.post('/add', protect, uploadPostImages, addPost);
postRouter.get('/feed', protect, getFeedPosts);
postRouter.post('/like', protect, likePost);

export default postRouter;
