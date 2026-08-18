import express from 'express';
import { protect } from '../../shared/middlewares/auth.js';
import { upload } from "../../shared/configs/multer.js";
import { addStory, getStories } from './story.controller.js';

const storyRouter = express.Router();

storyRouter.post('/create', upload.single('media'), protect, addStory);
storyRouter.get('/get', protect, getStories);

export default storyRouter;
