import { useEffect, useState } from "react";
import { Heart, MessageCircle, Share2, BadgeCheck, Trash2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import api from "../api/axios";

// Custom confirmation modal — replaces window.confirm()
const DeleteModal = ({ onConfirm, onCancel, isDeleting }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 dark:bg-red-500/10">
                    <Trash2 className="w-5 h-5 text-red-500" strokeWidth={2} />
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-[15px] dark:text-slate-100">Delete post?</p>
                    <p className="text-[13px] text-gray-500 mt-0.5 dark:text-slate-400">This action cannot be undone.</p>
                </div>
            </div>
            <div className="flex gap-2 mt-5">
                <button
                    onClick={onCancel}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={isDeleting}
                    className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                    {isDeleting ? "Deleting..." : "Delete"}
                </button>
            </div>
        </div>
    </div>
);

const PostCard = ({ post }) => {
    const postWithHasTags = post.content.replace(/(#\w+)/g, '<span class="text-purple-600 dark:text-purple-400 font-medium hover:underline cursor-pointer">$1</span>');
    const postWithMentions = postWithHasTags.replace(/(@\w+)/g, '<span class="text-blue-500 dark:text-blue-400 font-medium hover:underline cursor-pointer">$1</span>');

    const [likes, setLikes] = useState(post.likes_count?.length || 0);
    const [isLiked, setIsLiked] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        setLikes(post.likes_count?.length || 0);
        setIsLiked(post.likes_count?.includes(currentUser?._id) || false);
    }, [post.likes_count, currentUser?._id]);

    const handleLike = async () => {
        const previousLiked = isLiked;
        const previousLikes = likes;
        setIsLiked(!previousLiked);
        setLikes(previousLiked ? Math.max(previousLikes - 1, 0) : previousLikes + 1);
        try {
            const token = await getToken();
            const { data } = await api.post('/api/post/like', { postId: post._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!data.success) throw new Error(data.message);
        } catch (error) {
            setIsLiked(previousLiked);
            setLikes(previousLikes);
            toast.error(error.response?.data?.message || error.message || "Failed to update like");
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const token = await getToken();
            const { data } = await api.delete(`/api/post/delete/${post._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success(data.message);
                setShowDeleteModal(false);
                window.location.reload();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to delete post");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleShare = () => {
        const postUrl = `${window.location.origin}/?postId=${post._id}`;
        navigator.clipboard.writeText(postUrl)
            .then(() => toast.success("Post link copied to clipboard!"))
            .catch(() => toast.error("Failed to copy link"));
    };

    const getTimeAgo = (dateString) => {
        const now = new Date();
        const posted = new Date(dateString);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return posted.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <>
            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <DeleteModal
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                    isDeleting={isDeleting}
                />
            )}

            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-none dark:shadow-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <div onClick={() => navigate('/profile/' + post.user._id)} className="w-11 h-11 shrink-0 rounded-full overflow-hidden border border-gray-100 cursor-pointer dark:border-slate-800">
                            <img src={post.user.profile_picture} alt={post.user.full_name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span onClick={() => navigate('/profile/' + post.user._id)} className="font-semibold text-gray-900 text-[15px] leading-tight hover:underline cursor-pointer truncate dark:text-slate-100">
                                    {post.user.full_name}
                                </span>
                                {post.user.is_verified && (
                                    <BadgeCheck className="w-[18px] h-[18px] text-blue-500 shrink-0" fill="currentColor" stroke="white" strokeWidth={1.5} />
                                )}
                            </div>
                            <div className="flex items-center text-[13px] text-gray-500 mt-0.5 min-w-0 dark:text-slate-400">
                                <span onClick={() => navigate('/profile/' + post.user._id)} className="hover:text-gray-700 cursor-pointer transition-colors truncate dark:hover:text-slate-300">@{post.user.username}</span>
                                <span className="mx-1.5 text-gray-300 shrink-0 dark:text-slate-600">•</span>
                                <span className="shrink-0">{getTimeAgo(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                    {currentUser?._id === (post.user._id || post.user) && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete post"
                        >
                            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
                        </button>
                    )}
                </div>

                {/* Content */}
                {post.content && (
                    <div
                        className="mt-3.5 text-gray-800 text-[15px] sm:text-base whitespace-pre-wrap leading-relaxed break-all dark:text-slate-200"
                        dangerouslySetInnerHTML={{ __html: postWithMentions }}
                    />
                )}

                {/* Media */}
                {post.image_urls && post.image_urls.length > 0 && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer dark:border-slate-800 dark:bg-slate-950">
                        <img src={post.image_urls[0]} alt="Post media" loading="lazy" className="w-full max-h-[500px] object-cover hover:opacity-95 transition-opacity" />
                    </div>
                )}

                <div className="mt-4 pt-1 flex items-center gap-6">
                    <button onClick={handleLike} className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-500'}`}>
                        <div className={`p-1.5 rounded-full group-hover:bg-red-50 transition-colors dark:group-hover:bg-red-500/10 ${isLiked ? 'bg-red-50 dark:bg-red-500/10' : ''}`}>
                            <Heart className={`w-5 h-5 transition-transform duration-300 group-active:scale-75 ${isLiked ? 'fill-current' : ''}`} />
                        </div>
                        <span className={`text-[15px] font-medium ${isLiked ? '' : 'group-hover:text-red-500'}`}>{likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group dark:text-slate-400 dark:hover:text-blue-500">
                        <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors dark:group-hover:bg-blue-500/10">
                            <MessageCircle className="w-5 h-5 transition-transform duration-300 group-active:scale-75" />
                        </div>
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group dark:text-slate-400 dark:hover:text-green-500">
                        <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors dark:group-hover:bg-green-500/10">
                            <Share2 className="w-5 h-5 transition-transform duration-300 group-active:scale-75" />
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default PostCard;