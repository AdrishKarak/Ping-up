import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";

const RecentMessage = () => {
    const [messages, setMessages] = useState([]);
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
    }, [fetchMessages])

    const getTimeAgo = (dateString) => {
        if (!dateString) return "";
        const now = new Date();
        const posted = new Date(dateString);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return posted.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return (
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl w-full max-w-[320px] mt-4 min-h-20 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 text-sm text-slate-900 border border-white/50 dark:border-slate-800/50 overflow-hidden box-border dark:text-slate-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 tracking-tight dark:text-slate-200">Recent Messages</h3>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </div>
            <div className="flex flex-col max-h-64 overflow-y-auto no-scrollbar gap-1">
                {
                    messages.length > 0 ? messages.map((message, index) => {
                        const otherUser = message.from_user_id?._id === currentUser?._id ? message.to_user_id : message.from_user_id;

                        return (
                        <Link 
                            to={`/messages/${otherUser?._id}`} 
                            key={index} 
                            className="flex items-center gap-3.5 py-3.5 px-3 -mx-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 group"
                        >
                            <div className="relative shrink-0">
                                <img 
                                    src={otherUser?.profile_picture} 
                                    alt="" 
                                    className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100 dark:bg-slate-800 transition-transform group-hover:scale-105" 
                                />
                                {message.to_user_id?._id === currentUser?._id && !message.seen && (
                                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-purple-600 border-2 border-white rounded-full dark:border-slate-900 z-10 shadow-sm" />
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5 min-w-0">
                                    <span className="font-bold text-slate-900 truncate pr-2 dark:text-slate-200 text-[13px]">{otherUser?.full_name}</span>
                                    <span className="text-[10px] font-bold text-slate-400 shrink-0 dark:text-slate-500 uppercase">{getTimeAgo(message.createdAt)}</span>
                                </div>
                                <p className={`truncate text-[12px] w-full ${message.to_user_id?._id === currentUser?._id && !message.seen ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {message.text ? message.text : (message.media_url ? 'Sent an attachment' : 'Sent a message')}
                                </p>
                            </div>
                        </Link>
                    )}) : (
                        <div className="py-6 text-center">
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No recent messages yet.</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}

export default RecentMessage;
