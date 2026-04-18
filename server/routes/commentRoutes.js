import express from 'express';
import { addComment, getComments, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middlewares/auth.js';

const commentRouter = express.Router();

commentRouter.post('/add', protect, addComment);
commentRouter.get('/:postId', protect, getComments);
commentRouter.delete('/:commentId', protect, deleteComment);

export default commentRouter;
