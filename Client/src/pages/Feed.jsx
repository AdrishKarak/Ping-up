import React, { useState } from 'react';
import { dummyPostsData } from '../assets/assets'
import Loading from '../components/Loading';


const Feed = () => {
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async () => {
        setFeeds(dummyPostsData);
    }

    useEffect(() => {
        fetchFeeds();
    }, [])

    return !loading ? (
        <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
            {/*stories and post */}
            <div>

            </div>

            {/*right side bar */}
            <div>

            </div>
        </div>
    ) : <Loading />
};

export default Feed;