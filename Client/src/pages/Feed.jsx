import React, { useCallback, useEffect, useState, useRef } from 'react';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessage from '../components/RecentMessage';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { PostSkeleton } from '../components/Skeletons';
import { motion, AnimatePresence } from 'framer-motion';

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingMore, setFetchingMore] = useState(false);
    const { getToken } = useAuth();
    const observerTarget = useRef(null);
    const [searchParams] = useSearchParams();
    const postIdParam = searchParams.get('postId');

    const fetchFeeds = useCallback(async (pageNum) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setFetchingMore(true);

            const token = await getToken();

            let specificPost = null;
            if (pageNum === 1 && postIdParam) {
                try {
                    const { data: postData } = await api.get(`/api/post/${postIdParam}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (postData.success) {
                        specificPost = postData.post;
                    }
                } catch (e) {
                    console.log("Could not load specific post", e);
                }
            }

            const { data } = await api.get(`/api/post/feed?page=${pageNum}&limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setFeeds(prev => {
                    let newPosts = data.posts || [];
                    let combined = [];

                    if (pageNum === 1) {
                        if (specificPost) {
                            combined = [specificPost, ...newPosts];
                        } else {
                            combined = newPosts;
                        }
                    } else {
                        combined = [...prev, ...newPosts];
                    }

                    // Global deduplication to prevent double-rendering of same posts
                    const uniquePosts = [];
                    const seen = new Set();
                    for (const p of combined) {
                        if (!seen.has(p._id)) {
                            seen.add(p._id);
                            uniquePosts.push(p);
                        }
                    }
                    return uniquePosts;
                });
                setHasMore(data.hasMore);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to load feed");
        } finally {
            setLoading(false);
            setFetchingMore(false);
        }
    }, [getToken, postIdParam]);

    useEffect(() => {
        fetchFeeds(page);
    }, [page, fetchFeeds]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loading && !fetchingMore) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, fetchingMore]);

    return (
        <div className='h-full overflow-y-auto overflow-x-hidden no-scrollbar py-4 sm:py-8 lg:py-10 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-4 flex items-start justify-center gap-6 lg:gap-10 xl:gap-20 2xl:gap-32'>

            {/* Center column: stories and posts */}
            <div className='w-full max-w-full sm:max-w-[600px] md:max-w-[650px] lg:max-w-[720px] flex flex-col shrink-0 min-w-0'>
                <StoriesBar />
                <div className='px-4 sm:px-0 mt-2 space-y-4 sm:space-y-6 w-full box-border pb-10'>
                    {loading ? (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {feeds.map((post) => (
                                <PostCard 
                                    key={post._id} 
                                    post={post} 
                                    onDelete={(postId) => setFeeds(prev => prev.filter(p => p._id !== postId))}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                    
                    {fetchingMore && (
                        <div className="space-y-4 sm:space-y-6">
                            <PostSkeleton />
                        </div>
                    )}
                    
                    {hasMore && !loading && (
                        <div ref={observerTarget} className="h-10 w-full pointer-events-none"></div>
                    )}
                    
                    {!hasMore && feeds.length > 0 && (
                        <p className="text-center text-slate-500 py-6 text-sm font-medium">No more posts to load.</p>
                    )}
                </div>
            </div>

            {/* Right side bar */}
            <div className='hidden xl:flex flex-col gap-4 sticky top-4 lg:top-8 w-80 shrink-0 pb-10'>
                <div className='w-full bg-white text-xs p-5 rounded-2xl flex flex-col gap-3 shadow border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none'>
                    <h3 className='text-slate-900 font-bold text-sm tracking-wide dark:text-slate-100'>Sponsored</h3>
                    <img src={assets.sponsored_img} alt="image-sponsor" className='w-full h-auto object-cover rounded-xl' />
                    <div className='flex flex-col gap-1'>
                        <p className='text-slate-800 font-bold text-sm dark:text-slate-200'>Email Marketing</p>
                        <p className='text-slate-500 leading-snug dark:text-slate-400'>Grow your business with a powerful platform and connect with others on Ping-up</p>
                    </div>
                </div>
                <RecentMessage />
            </div>
        </div>
    );
};

export default Feed;
