import Comment from '../models/Comment.js';
import Post from '../models/Post.js';

export const addComment = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { postId, content, parentCommentId } = req.body;

        if (!content || !postId) {
            return res.status(400).json({ success: false, message: "Content and Post ID are required" });
        }

        const comment = await Comment.create({
            user: userId,
            post: postId,
            content,
            parent_comment: parentCommentId || null
        });

        // Increment comments_count in Post
        await Post.findByIdAndUpdate(postId, { $inc: { comments_count: 1 } });

        const populatedComment = await Comment.findById(comment._id).populate('user');

        return res.status(201).json({ success: true, comment: populatedComment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ post: postId })
            .populate('user')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, comments });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { commentId } = req.params;

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ success: false, message: "Comment not found" });
        }

        if (comment.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Count how many comments we are deleting (parent + all direct replies)
        const repliesCount = await Comment.countDocuments({ parent_comment: commentId });
        const totalDeleted = 1 + repliesCount;

        // Decrement comments_count in Post
        await Post.findByIdAndUpdate(comment.post, { $inc: { comments_count: -totalDeleted } });

        // Also delete sub-comments (replies)
        await Comment.deleteMany({ parent_comment: commentId });
        await Comment.findByIdAndDelete(commentId);

        return res.status(200).json({ success: true, message: "Comment deleted" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
