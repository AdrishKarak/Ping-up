import { useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react";

const PostCard = ({ post }) => {
    // Parse hashtags and mentions to make them styled and colorful
    const postWithHasTags = post.content.replace(/(#\w+)/g, '<span class="text-purple-600 font-medium hover:underline cursor-pointer">$1</span>');
    const postWithMentions = postWithHasTags.replace(/(@\w+)/g, '<span class="text-blue-500 font-medium hover:underline cursor-pointer">$1</span>');

    const [likes, setLikes] = useState(post.likes_count?.length || 0);
    // Since we are using dummy data, checking if current user is in likes
    const [isLiked, setIsLiked] = useState(post.likes_count?.includes(dummyUserData._id) || false);

    const handleLike = async () => {
        // TODO: Integrate backend API call here when ready
        // await api.toggleLike(post._id);

        setIsLiked(!isLiked);
        setLikes(isLiked ? likes - 1 : likes + 1);
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
        return posted.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/80 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden border border-gray-100">
                        <img 
                            src={post.user.profile_picture} 
                            alt={post.user.full_name} 
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-semibold text-gray-900 text-[15px] leading-tight hover:underline cursor-pointer truncate">
                                {post.user.full_name}
                            </span>
                            {post.user.is_verified && (
                                <BadgeCheck className="w-[18px] h-[18px] text-blue-500 shrink-0" fill="currentColor" stroke="white" strokeWidth={1.5} />
                            )}
                        </div>
                        <div className="flex items-center text-[13px] text-gray-500 mt-0.5 min-w-0">
                            <span className="hover:text-gray-700 cursor-pointer transition-colors truncate">@{post.user.username}</span>
                            <span className="mx-1.5 text-gray-300 shrink-0">•</span>
                            <span className="shrink-0">{getTimeAgo(post.createdAt)}</span>
                        </div>
                    </div>
                </div>
                {/* Optional Three dots menu could go here */}
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="1"/>
                        <circle cx="19" cy="12" r="1"/>
                        <circle cx="5" cy="12" r="1"/>
                    </svg>
                </button>
            </div>

            {/* Content */}
            {post.content && (
                <div 
                    className="mt-3.5 text-gray-800 text-[15px] sm:text-base whitespace-pre-wrap leading-relaxed break-all"
                    dangerouslySetInnerHTML={{ __html: postWithMentions }}
                />
            )}

            {/* Media */}
            {post.image_urls && post.image_urls.length > 0 && (
                <div className="mt-4 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 cursor-pointer">
                    <img 
                        src={post.image_urls[0]} 
                        alt="Post media" 
                        loading="lazy"
                        className="w-full max-h-[500px] object-cover hover:opacity-95 transition-opacity"
                    />
                </div>
            )}

            {/* Action Buttons (Footer) */}
            <div className="mt-4 pt-1 flex items-center gap-6">
                <button 
                    onClick={handleLike} 
                    className={`flex items-center gap-2 transition-colors group ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
                >
                    <div className={`p-1.5 rounded-full group-hover:bg-red-50 transition-colors ${isLiked ? 'bg-red-50' : ''}`}>
                        <Heart 
                            className={`w-5 h-5 transition-transform duration-300 group-active:scale-75 ${isLiked ? 'fill-current' : ''}`} 
                        />
                    </div>
                    <span className={`text-[15px] font-medium ${isLiked ? '' : 'group-hover:text-red-500'}`}>{likes}</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-blue-50 transition-colors">
                        <MessageCircle className="w-5 h-5 transition-transform duration-300 group-active:scale-75" />
                    </div>
                    {/* Hardcoded 12 as per user design mockup */}
                    <span className="text-[15px] font-medium group-hover:text-blue-500">12</span>
                </button>
                
                <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group">
                    <div className="p-1.5 rounded-full group-hover:bg-green-50 transition-colors">
                        <Share2 className="w-5 h-5 transition-transform duration-300 group-active:scale-75" />
                    </div>
                    {/* Hardcoded 7 as per user design mockup */}
                    <span className="text-[15px] font-medium group-hover:text-green-500">7</span>
                </button>
            </div>
        </div>
    );
};

export default PostCard;