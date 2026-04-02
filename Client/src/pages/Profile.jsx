import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dummyUserData, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import UserProfileinfo from '../components/UserProfileinfo';
import PostCard from '../components/PostCard';
import { Heart, ImageIcon, MessageSquareText } from 'lucide-react';

const TABS = [
    { key: "posts", label: "Posts" },
    { key: "media", label: "Media" },
    { key: "likes", label: "Likes" },
];

const Profile = () => {
    const { profileId } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [activeTab, setActiveTab] = useState("posts");

    const fetchUser = async () => {
        setUser(dummyUserData);
        setPosts(dummyPostsData);
    }

    useEffect(() => {
        fetchUser();
    }, []);

    // --- Tab content helpers ---
    const userPosts = posts;

    const mediaPosts = posts.filter(
        (p) => p.image_urls && p.image_urls.length > 0
    );

    // Flatten all images from media posts for the grid
    const allImages = mediaPosts.flatMap((p) =>
        p.image_urls.map((url, i) => ({ url, postId: p._id, index: i }))
    );

    const likedPosts = posts.filter(
        (p) => p.likes_count && p.likes_count.includes(dummyUserData._id)
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "posts":
                return userPosts.length > 0 ? (
                    <div className="space-y-4 sm:space-y-5">
                        {userPosts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<MessageSquareText className="w-10 h-10 text-gray-300" />}
                        title="No posts yet"
                        description="When you create posts, they'll show up here."
                    />
                );

            case "media":
                return allImages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {allImages.map((img, idx) => (
                            <div
                                key={`${img.postId}-${img.index}`}
                                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer border border-gray-100"
                            >
                                <img
                                    src={img.url}
                                    alt={`Media ${idx + 1}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<ImageIcon className="w-10 h-10 text-gray-300" />}
                        title="No media yet"
                        description="Photos and images from posts will appear here."
                    />
                );

            case "likes":
                return likedPosts.length > 0 ? (
                    <div className="space-y-4 sm:space-y-5">
                        {likedPosts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Heart className="w-10 h-10 text-gray-300" />}
                        title="No liked posts"
                        description="Posts you like will show up here."
                    />
                );

            default:
                return null;
        }
    };

    return user ? (
        <div className="relative h-full overflow-y-auto no-scrollbar bg-gray-50/80 py-4 sm:py-6 md:py-8 px-3 sm:px-6">
            <div className="max-w-2xl mx-auto">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden border border-gray-100/60">
                    {/* Cover photo */}
                    <div className="h-36 sm:h-44 md:h-56 bg-linear-to-br from-purple-300 via-pink-200 to-indigo-200 relative overflow-hidden">
                        {user.cover_photo && (
                            <img
                                src={user.cover_photo}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        )}
                        {/* Subtle linear overlay at bottom for text readability */}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/10 to-transparent" />
                    </div>

                    {/* Profile info */}
                    <UserProfileinfo
                        user={user}
                        posts={posts}
                        profileId={profileId}
                        setShowEditProfile={setShowEditProfile}
                    />

                    {/* Tabs */}
                    <div className="px-5 md:px-8 pb-1">
                        <div className="flex items-center border-t border-gray-100">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`
                                        relative flex-1 py-3 text-sm font-semibold tracking-wide transition-all duration-200 cursor-pointer
                                        ${activeTab === tab.key
                                            ? "text-purple-600"
                                            : "text-gray-400 hover:text-gray-600"
                                        }
                                    `}
                                >
                                    {tab.label}
                                    {/* Active indicator bar */}
                                    {activeTab === tab.key && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-[3px] rounded-full bg-purple-500 transition-all" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="mt-5 pb-8">
                    {renderTabContent()}
                </div>
            </div>
            {
                showEditProfile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                            <p className="text-xl font-bold text-gray-800">Edit Profile Modal</p>
                            <button 
                                onClick={() => setShowEditProfile(false)}
                                className="px-5 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )
            }


        </div>
    ) : (<Loading />)
};

// Reusable empty state for tabs with no content
const EmptyState = ({ icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            {icon}
        </div>
        <p className="text-gray-800 font-semibold text-base">{title}</p>
        <p className="text-gray-400 text-sm mt-1">{description}</p>
    </div>
);

export default Profile;
