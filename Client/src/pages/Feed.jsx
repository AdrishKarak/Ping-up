import React, { useEffect, useState } from 'react';
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessage from '../components/RecentMessage';

const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async () => {
        // TODO: Replace with future backend call
        setFeeds(dummyPostsData);
        setLoading(false);
    }

    useEffect(() => {
        fetchFeeds();
    }, [])

    return !loading ? (
        <div className='h-full overflow-y-auto overflow-x-hidden no-scrollbar py-4 sm:py-8 lg:py-10 px-0 sm:px-6 md:px-8 lg:px-12 xl:px-4 flex items-start justify-center gap-6 lg:gap-10 xl:gap-20 2xl:gap-32'>

            {/* Center column: stories and posts */}
            <div className='w-full max-w-full sm:max-w-[600px] md:max-w-[650px] lg:max-w-[720px] flex flex-col shrink-0'>
                <StoriesBar />
                <div className='px-4 sm:px-0 mt-2 space-y-4 sm:space-y-6 w-full box-border'>
                    {feeds.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            </div>

            {/* Right side bar */}
            <div className='hidden xl:flex flex-col gap-4 sticky top-4 lg:top-8 w-80 shrink-0 pb-10'>
                <div className='w-full bg-white text-xs p-5 rounded-2xl flex flex-col gap-3 shadow border border-slate-100'>
                    <h3 className='text-slate-900 font-bold text-sm tracking-wide'>Sponsored</h3>
                    <img src={assets.sponsored_img} alt="image-sponsor" className='w-full h-auto object-cover rounded-xl' />
                    <div className='flex flex-col gap-1'>
                        <p className='text-slate-800 font-bold text-sm'>Email Marketing</p>
                        <p className='text-slate-500 leading-snug'>Grow your business with a powerful platform and connect with others on Ping-up</p>
                    </div>
                </div>
                <RecentMessage />
            </div>
        </div>
    ) : <Loading />
};

export default Feed;