import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ImageIcon, MessageSquare } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const Messages = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.value);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = await getToken();
                const [connectionsResponse, recentResponse] = await Promise.all([
                    api.get('/api/user/connections', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    api.get('/api/user/recent-messages', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (!connectionsResponse.data.success) {
                    throw new Error(connectionsResponse.data.message);
                }

                if (!recentResponse.data.success) {
                    throw new Error(recentResponse.data.message);
                }

                const conversations = recentResponse.data.messages || [];
                const connectionUsers = connectionsResponse.data.connections || [];
                const userMap = new Map();

                conversations.forEach((message) => {
                    const otherUser = message.from_user_id?._id === currentUser?._id ? message.to_user_id : message.from_user_id;
                    if (otherUser?._id) {
                        userMap.set(otherUser._id, { ...otherUser, lastMessage: message });
                    }
                });

                connectionUsers.forEach((user) => {
                    if (!userMap.has(user._id)) {
                        userMap.set(user._id, { ...user, lastMessage: null });
                    }
                });

                setPeople(Array.from(userMap.values()));
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to load conversations");
            } finally {
                setLoading(false);
            }
        }

        if (currentUser?._id) {
            fetchConversations();
        }
    }, [getToken, currentUser?._id]);

    const getPreview = (message) => {
        if (!message) return "Start a conversation";
        if (message.text) return message.text;
        if (message.media_url) return "Shared an image";
        return "Sent a message";
    }

    return loading ? <Loading /> : (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-full max-w-[800px] flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1.5 tracking-tight dark:text-slate-100">Messages</h1>
                    <p className="text-slate-500 text-sm md:text-[15px] dark:text-slate-400">Talk to your friends and family</p>
                </div>

                <div className="flex flex-col gap-4 sm:gap-6">
                    {people.length > 0 ? people.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white rounded-2xl p-4 sm:p-5 flex gap-4 md:gap-5 items-start shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-none dark:shadow-none"
                        >
                            {/* Avatar */}
                            <div className="shrink-0 pt-0.5">
                                <img
                                    src={user.profile_picture}
                                    alt={user.full_name}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shadow-sm bg-slate-100 dark:bg-slate-800"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-2 md:pr-4 flex flex-col pt-0.5">
                                <h3 className="font-bold text-slate-800 text-[15px] md:text-base leading-snug truncate dark:text-slate-100">
                                    {user.full_name}
                                </h3>
                                <p className="text-[13px] text-slate-500 mb-1.5 truncate dark:text-slate-400">@{user.username}</p>

                                <p className="text-[13px] md:text-sm text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-wrap wrap-break-word flex items-center gap-1.5 dark:text-slate-300">
                                    {user.lastMessage?.media_url && !user.lastMessage?.text && <ImageIcon className="w-3.5 h-3.5 shrink-0" />}
                                    <span className="truncate">{getPreview(user.lastMessage)}</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2.5 shrink-0">
                                <button
                                    onClick={() => navigate(`/messages/${user._id}`)}
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-indigo-50/70 text-indigo-500 hover:bg-indigo-100 transition-colors dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 dark:text-indigo-400"
                                    title="Message"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400"
                                    title="View Profile"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-500 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400">
                            Your conversations and accepted connections will appear here.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
