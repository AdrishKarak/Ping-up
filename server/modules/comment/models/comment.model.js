import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true, trim: true },
    parent_comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // For replies
}, { timestamps: true });

// Index for faster lookups
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parent_comment: 1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
