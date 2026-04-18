import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, CornerDownRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Loading from './Loading';

const CommentItem = ({ comment, allComments, onReply, depth = 0 }) => {
    const replies = allComments.filter(c => c.parent_comment === comment._id);
    const [showReplies, setShowReplies] = useState(true);

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const posted = new Date(dateString);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        return `${diffDays}d`;
    };

    return (
        <div className={`mt-3 ${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-slate-100 dark:border-slate-800 pl-4' : ''}`}>
            <div className="flex gap-3">
                <img 
                    src={comment.user.profile_picture} 
                    alt={comment.user.full_name} 
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl px-4 py-2 inline-block max-w-full">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                                {comment.user.full_name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                {getTimeAgo(comment.createdAt)}
                            </span>
                        </div>
                        <p className="text-[13px] text-slate-700 dark:text-slate-300 break-words leading-relaxed">
                            {comment.content}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-1 ml-2">
                        <button 
                            onClick={() => onReply(comment)}
                            className="text-[11px] font-bold text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                        >
                            Reply
                        </button>
                        {replies.length > 0 && (
                            <button 
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1"
                            >
                                {showReplies ? 'Hide replies' : `View ${replies.length} replies`}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showReplies && replies.map(reply => (
                    <motion.div
                        key={reply._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        <CommentItem 
                            comment={reply} 
                            allComments={allComments} 
                            onReply={onReply} 
                            depth={depth + 1} 
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

const CommentModal = ({ postId, onClose, onCommentAdded }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { getToken } = useAuth();

    const fetchComments = useCallback(async () => {
        try {
            const token = await getToken();
            const { data } = await api.get(`/api/comment/${postId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            toast.error("Failed to load comments");
        } finally {
            setLoading(false);
        }
    }, [postId, getToken]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const token = await getToken();
            const { data } = await api.post('/api/comment/add', {
                postId,
                content: newComment,
                parentCommentId: replyTo?._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setComments([data.comment, ...comments]);
                setNewComment("");
                setReplyTo(null);
                if (onCommentAdded) {
                    onCommentAdded();
                }
            }
        } catch (error) {
            toast.error("Failed to post comment");
        } finally {
            setIsSubmitting(false);
        }
    };

    const topLevelComments = comments.filter(c => !c.parent_comment);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6 sm:p-6">
            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-slate-800"
            >
                {/* Header */}
                <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-purple-600" />
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">Comments</h3>
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[11px] font-bold text-slate-500">
                            {comments.length}
                        </span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-2">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center">
                            <Loading />
                        </div>
                    ) : topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => (
                            <CommentItem 
                                key={comment._id} 
                                comment={comment} 
                                allComments={comments}
                                onReply={(c) => {
                                    setReplyTo(c);
                                    setNewComment(`@${c.user.full_name} `);
                                }}
                            />
                        ))
                    ) : (
                        <div className="py-20 text-center">
                            <MessageCircle className="w-12 h-12 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    {replyTo && (
                        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-xl mb-3 border border-purple-100 dark:border-purple-900/30">
                            <div className="flex items-center gap-2">
                                <CornerDownRight className="w-4 h-4 text-purple-600" />
                                <span className="text-xs text-purple-700 dark:text-purple-400">
                                    Replying to <span className="font-bold">{replyTo.user.full_name}</span>
                                </span>
                            </div>
                            <button onClick={() => { setReplyTo(null); setNewComment(""); }} className="text-purple-400 hover:text-purple-600 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            autoFocus
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
                            className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all dark:text-slate-100 dark:placeholder-slate-500"
                        />
                        <button 
                            disabled={!newComment.trim() || isSubmitting}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl bg-purple-600 text-white disabled:opacity-50 disabled:bg-slate-400 shadow-md shadow-purple-200 dark:shadow-none transition-all active:scale-90"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CommentModal;
