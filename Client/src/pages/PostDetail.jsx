import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import PostCard from '../components/PostCard';
import { PostSkeleton } from '../components/Skeletons';
import SEO from '../components/SEO';

const PostDetail = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSinglePost = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                const { data } = await api.get(`/api/post/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (data.success) {
                    setPost(data.post);
                } else {
                    setError(data.message || "Failed to load post");
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to fetch post");
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchSinglePost();
        }
    }, [postId, getToken]);

    return (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <SEO 
                title={post?.user?.full_name ? `Post by ${post.user.full_name}` : "Post View"} 
                description="View this post on PingUp." 
            />
            <div className="w-full max-w-[680px] flex flex-col">
                {/* Header with Back button */}
                <div className="mb-6 flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-xl border border-gray-200 bg-white hover:border-purple-300 hover:text-purple-600 hover:shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:hover:border-purple-500 dark:hover:text-purple-400 dark:text-slate-300 cursor-pointer transition-all duration-200 active:scale-95"
                        title="Back to Feed"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight dark:text-slate-100">
                            Post
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm dark:text-slate-400">
                            View details and comments of this post
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full pb-10">
                    {loading ? (
                        <PostSkeleton />
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 dark:bg-red-950/20">
                                <span className="text-red-500 text-2xl font-bold">!</span>
                            </div>
                            <p className="text-gray-800 font-semibold text-base dark:text-slate-100">Post unavailable</p>
                            <p className="text-gray-400 text-sm mt-1 max-w-sm dark:text-slate-500">
                                {error}
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-5 px-6 py-2 bg-linear-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:shadow-md cursor-pointer active:scale-95 transition-all"
                            >
                                Back to Feed
                            </button>
                        </div>
                    ) : post ? (
                        <PostCard 
                            post={post} 
                            onDelete={() => navigate('/')} 
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;
