import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { MessageSquare, Image } from "lucide-react";

const RecentMessage = () => {
    const [messages, setMessages] = useState([]);
    const [visibleCount, setVisibleCount] = useState(4);
    const { getToken } = useAuth();
    const currentUser = useSelector((state) => state.user.value);

    const fetchMessages = useCallback(async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/user/recent-messages', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setMessages(data.messages || []);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to load recent messages");
        }
    }, [getToken]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const getTimeAgo = (dateString) => {
        if (!dateString) return "";
        const now = new Date();
        const posted = new Date(dateString);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "1m";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return posted.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="w-full bg-white rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 dark:bg-slate-900 dark:border-slate-800/80 dark:shadow-none flex flex-col gap-3.5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-purple-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm tracking-wide">Recent Messages</h3>
                </div>
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            </div>

            {/* List */}
            <div className="flex flex-col gap-1.5">
                {messages.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto no-scrollbar">
                            {messages.slice(0, visibleCount).map((message, index) => {
                                const otherUser = message.from_user_id?._id === currentUser?._id ? message.to_user_id : message.from_user_id;
                                if (!otherUser) return null;

                                const isSentByMe = message.from_user_id?._id === currentUser?._id;
                                const isUnread = !isSentByMe && !message.seen;

                                return (
                                    <Link 
                                        to={`/messages/${otherUser._id}`} 
                                        key={message._id || index} 
                                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-all duration-200 group relative border border-transparent hover:border-purple-100/30 dark:hover:border-purple-900/10"
                                    >
                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <img 
                                                src={otherUser.profile_picture} 
                                                alt={otherUser.full_name} 
                                                className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 transition-transform group-hover:scale-105" 
                                            />
                                            {isUnread && (
                                                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-600 border-2 border-white rounded-full dark:border-slate-900 z-10 shadow-sm" />
                                            )}
                                        </div>

                                        {/* Text content */}
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5 min-w-0">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[13px] group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                    {otherUser.full_name}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase ml-2">
                                                    {getTimeAgo(message.createdAt)}
                                                </span>
                                            </div>
                                            <p className={`truncate text-xs ${isUnread ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                {isSentByMe ? <span className="text-slate-400 dark:text-slate-500 font-normal">You: </span> : null}
                                                {message.text ? (
                                                    message.text
                                                ) : message.media_url ? (
                                                    <span className="inline-flex items-center gap-1 text-purple-500 font-medium">
                                                        <Image size={12} /> Photo
                                                    </span>
                                                ) : (
                                                    "Sent a message"
                                                )}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                        {messages.length > visibleCount && (
                            <div className="flex justify-center pt-1">
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 4)}
                                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 active:scale-98 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1"
                                >
                                    <span>View More Messages</span>
                                    <span className="bg-slate-200/80 dark:bg-slate-700/60 px-1.5 py-0.5 rounded text-[10px]">
                                        +{Math.min(4, messages.length - visibleCount)}
                                    </span>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                        <MessageSquare size={24} className="text-slate-300 dark:text-slate-600" />
                        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">No recent messages yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentMessage;
