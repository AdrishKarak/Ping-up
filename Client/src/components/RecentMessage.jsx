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
        <div className="bg-white w-full max-w-[320px] mt-4 min-h-20 rounded-xl shadow p-5 text-sm text-slate-900 border border-slate-100 overflow-hidden box-border dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:shadow-none">
            <h3 className="font-bold mb-3 text-slate-800 tracking-wide dark:text-slate-200">Recent Messages</h3>
            <div className="flex flex-col max-h-64 overflow-y-auto overflow-x-hidden no-scrollbar">
                {
                    messages.length > 0 ? messages.map((message, index) => {
                        const otherUser = message.from_user_id?._id === currentUser?._id ? message.to_user_id : message.from_user_id;

                        return (
                        <Link to={`/messages/${otherUser?._id}`} key={index} className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg dark:border-slate-800/50 dark:hover:bg-slate-800/50">
                            <div className="relative shrink-0">
                                <img src={otherUser?.profile_picture} alt="" className="w-10 h-10 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800 dark:shadow-none" />
                                {message.to_user_id?._id === currentUser?._id && !message.seen && (
                                    <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 border-2 border-white rounded-full dark:border-slate-900"></div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5 min-w-0">
                                    <span className="font-semibold text-slate-900 truncate pr-2 dark:text-slate-200">{otherUser?.full_name}</span>
                                    <span className="text-[11px] font-medium text-slate-400 shrink-0 dark:text-slate-500">{getTimeAgo(message.createdAt)}</span>
                                </div>
                                <p className={`truncate text-xs w-full ${message.to_user_id?._id === currentUser?._id && !message.seen ? 'font-medium text-slate-800 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {message.text ? message.text : (message.media_url ? 'Sent an attachment' : 'Sent a message')}
                                </p>
                            </div>
                        </Link>
                    )}) : (
                        <p className="py-4 text-xs text-slate-400 dark:text-slate-500">No recent messages yet.</p>
                    )
                }
            </div>
        </div>
    )
}

export default RecentMessage;
