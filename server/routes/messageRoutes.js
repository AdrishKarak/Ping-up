import express from 'express';
import { sseController, sendMessage, getMessages } from '../controllers/messageController.js';
import { protect } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';


const messageRouter = express.Router();

messageRouter.get('/sse/:userId', sseController);
messageRouter.post('/send', upload.single('media'), protect, sendMessage);
messageRouter.post('/get', protect, getMessages);


export default messageRouter;
