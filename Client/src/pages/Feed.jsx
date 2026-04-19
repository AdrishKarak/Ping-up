import React, { useEffect, useRef } from 'react';
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessage from '../components/RecentMessage';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import { PostSkeleton } from '../components/Skeletons';
import { AnimatePresence } from 'framer-motion';
import { useInfiniteQuery } from '@tanstack/react-query';

const Feed = () => {
    const { getToken } = useAuth();
    const observerTarget = useRef(null);

    const fetchFeedPosts = async ({ pageParam = null }) => {
        const token = await getToken();
        const url = pageParam 
            ? `/api/post/feed?cursor=${pageParam}&limit=10` 
            : '/api/post/feed?limit=10';
        
        const { data } = await api.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return data;
    };

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
        refetch
    } = useInfiniteQuery({
        queryKey: ['feed'],
        queryFn: fetchFeedPosts,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
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
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (status === 'error') return <div className="text-center py-20 text-red-500">Error: {error.message}</div>;

    const allPosts = data?.pages.flatMap(page => page.posts) || [];

    return (
        <div className='h-full overflow-y-auto overflow-x-hidden no-scrollbar py-4 sm:py-8 lg:py-10 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-4 flex items-start justify-center gap-6 lg:gap-10 xl:gap-20 2xl:gap-32'>

            {/* Center column: stories and posts */}
            <div className='w-full max-w-full sm:max-w-[600px] md:max-w-[650px] lg:max-w-[720px] flex flex-col shrink-0 min-w-0'>
                <StoriesBar />
                <div className='px-4 sm:px-0 mt-2 space-y-4 sm:space-y-6 w-full box-border pb-10'>
                    {status === 'pending' ? (
                        <>
                            <PostSkeleton />
                            <PostSkeleton />
                            <PostSkeleton />
                        </>
                    ) : (
                        <AnimatePresence mode='popLayout'>
                            {allPosts.map((post) => (
                                <PostCard 
                                    key={post._id} 
                                    post={post} 
                                    onDelete={() => refetch()} // Simply refetch to keep data in sync
                                />
                            ))}
                        </AnimatePresence>
                    )}
                    
                    {isFetchingNextPage && (
                        <div className="space-y-4 sm:space-y-6">
                            <PostSkeleton />
                        </div>
                    )}
                    
                    {hasNextPage && (
                        <div ref={observerTarget} className="h-10 w-full pointer-events-none"></div>
                    )}
                    
                    {!hasNextPage && allPosts.length > 0 && (
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
