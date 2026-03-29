import React, { useEffect, useState } from 'react';
import { dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';

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
        <div className='h-full overflow-y-auto no-scrollbar py-8 sm:py-10 px-4 sm:px-6 xl:px-10 xl:pr-48 flex items-start justify-start xl:justify-center gap-6 lg:gap-8'>

            {/* Center column: stories and posts */}
            <div className='w-full max-w-[720px] flex flex-col shrink-0'>
                <StoriesBar />
                <div className='p-2 sm:p-4 mt-2 space-y-6 w-full'>
                    {feeds.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            </div>

            {/* Right side bar */}
            <div className='hidden lg:flex flex-col w-[300px] xl:w-[320px] shrink-0 space-y-6 pt-4'>
                <div>
                    <h1>Sponsored</h1>
                </div>
                <h1>Recent messages</h1>
            </div>
        </div>
    ) : <Loading />
};

export default Feed;