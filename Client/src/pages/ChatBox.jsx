import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ImagePlus, Send, X, MoreVertical, Search, Phone, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const ChatBox = () => {
    const { userid } = useParams();
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Use TanStack Query to manage the target user's status/profile
    const { data: userData } = useQuery({
        queryKey: ['user-profile', userid],
        queryFn: async () => {
            const token = await getToken();
            const { data } = await api.post('/api/user/profiles', { profileId: userid }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return data.profile;
        },
        refetchInterval: 30000, // Refetch every 30s to update "isOnline"
        enabled: !!userid
    });

    const user = userData;

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const token = await getToken();
                const { data } = await api.post('/api/message/get', { to_user_id: userid }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setMessages([...(data.messages || [])].reverse());
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to load chat");
            } finally {
                setLoading(false);
            }
        }

        if (userid) {
            fetchChat();
        }
    }, [userid, getToken]);

    useEffect(() => {
        if (!currentUser?._id) return;

        const handleNewMessage = (event) => {
            const data = event.detail;
            const fromUserId = typeof data.from_user_id === "object" ? data.from_user_id._id : data.from_user_id;

            if (fromUserId === userid) {
                setMessages((prev) => [...prev, data]);
            }
        };

        window.addEventListener('new-message', handleNewMessage);

        return () => window.removeEventListener('new-message', handleNewMessage);
    }, [currentUser?._id, userid]);

    const sendMessage = async () => {
        if (!text.trim() && !image) {
            return;
        }

        setSending(true);

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append("to_user_id", userid);
            formData.append("text", text.trim());

            if (image) {
                formData.append("media", image);
                formData.append("media_type", "image");
            }

            const { data } = await api.post('/api/message/send', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                throw new Error(data.message);
            }

            setMessages((prev) => [...prev, {
                ...data.message,
                from_user_id: currentUser,
                to_user_id: userid
            }]);
            setText("");
            setImage(null);
            setImagePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const sortedMessages = messages.toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Group messages by date
    const groupedMessages = sortedMessages.reduce((groups, message) => {
        const date = new Date(message.createdAt).toDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(message);
        return groups;
    }, {});

    if (loading || !user) return <Loading />;

    return (
        <div className="flex-1 min-h-0 h-full w-full flex flex-col relative overflow-hidden bg-slate-50/50 dark:bg-[#020617]">
            {/* ── Decorative Background ── */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] dark:bg-purple-500/5" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/5" />
                <div className="absolute top-[20%] left-[10%] w-[20%] h-[20%] rounded-full bg-blue-500/5 blur-[80px]" />
            </div>

            {/* ── Header ── */}
            <div className="sticky top-0 z-20 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 dark:bg-slate-950/70 dark:border-slate-800/50">
                <button
                    onClick={() => navigate('/messages')}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-600 hover:text-purple-600 hover:shadow-md transition-all active:scale-95 shrink-0 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-purple-400"
                >
                    <ArrowLeft className="w-[18px] h-[18px]" />
                </button>

                <div className="relative shrink-0">
                    <img
                        src={user.profile_picture}
                        alt={user.full_name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-white shadow-sm dark:ring-slate-900"
                    />
                    {user.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full dark:border-slate-950">
                            <div className="w-full h-full rounded-full bg-emerald-500 animate-ping opacity-75" />
                        </div>
                    )}
                </div>

                <div className="min-w-0 flex-1 ml-0.5">
                    <h2 className="font-bold text-slate-900 text-base leading-tight truncate dark:text-slate-100">
                        {user.full_name}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-500 mt-0.5">
                        {user.isOnline ? 'Active now' : 'Currently offline'}
                    </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                    <button className="w-9 h-9 hidden sm:flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200">
                        <Phone className="w-[18px] h-[18px]" />
                    </button>
                    <button className="w-9 h-9 hidden sm:flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200">
                        <Video className="w-[18px] h-[18px]" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200">
                        <MoreVertical className="w-[18px] h-[18px]" />
                    </button>
                </div>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth px-4 sm:px-6 py-6 space-y-8 relative z-10">
                <AnimatePresence mode="popLayout" initial={false}>
                    {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                        <Motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            key={dateKey}
                            className="space-y-6"
                        >
                            {/* Date separator */}
                            <div className="flex items-center justify-center">
                                <div className="relative flex items-center w-full max-w-sm justify-center">
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800/60 transition-colors"></div>
                                    </div>
                                    <div className="relative px-4 py-1 rounded-full bg-white text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-100 dark:bg-slate-950 dark:border-slate-800/80 shadow-xs pointer-events-none transition-all">
                                        {formatDate(msgs[0].createdAt)}
                                    </div>
                                </div>
                            </div>

                            {/* Messages for this date */}
                            <div className="space-y-4">
                                {msgs.map((message, index) => {
                                    const fromUserId = typeof message.from_user_id === "object" ? message.from_user_id._id : message.from_user_id;
                                    const isSent = fromUserId === currentUser?._id;
                                    const isImage = message.message_type === 'image';

                                    return (
                                        <Motion.div
                                            key={message._id || index}
                                            initial={{ opacity: 0, x: isSent ? 20 : -20, scale: 0.9 }}
                                            animate={{ opacity: 1, x: 0, scale: 1 }}
                                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                            className={`flex group ${isSent ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] sm:max-w-[70%] flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                                                {/* Bubble Wrapper */}
                                                <div className="relative group/bubble">
                                                    <div
                                                        className={`
                                                            relative rounded-[20px] px-4 py-2.5 shadow-sm overflow-hidden
                                                            ${isSent
                                                                ? 'bg-linear-to-br from-indigo-600 via-purple-600 to-purple-700 text-white shadow-purple-500/20'
                                                                : 'bg-white/80 dark:bg-slate-800/50 backdrop-blur-xl text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-slate-700/50 shadow-slate-200/50'
                                                            }
                                                            ${isSent ? 'rounded-tr-md' : 'rounded-tl-md'}
                                                        `}
                                                    >
                                                        {isImage && message.media_url && (
                                                            <div className="relative group/img overflow-hidden rounded-xl mb-1.5 cursor-pointer">
                                                                <img
                                                                    src={message.media_url}
                                                                    alt="shared"
                                                                    className="max-h-[300px] w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/5 transition-colors" />
                                                            </div>
                                                        )}
                                                        {message.text && (
                                                            <p className="text-[14px] sm:text-[15px] leading-relaxed relative z-10">
                                                                {message.text}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                <div className={`mt-1.5 flex items-center gap-2 px-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium`}>
                                                    <span>{formatTime(message.createdAt)}</span>
                                                    {isSent && (
                                                        <span className={message.seen ? 'text-purple-500 font-bold' : ''}>
                                                            {message.seen ? 'Seen' : 'Sent'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Motion.div>
                                    );
                                })}
                            </div>
                        </Motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* ── Input Bar Section ── */}
            <div className="relative z-20 pb-4 sm:pb-8 pt-2 px-4 sm:px-10">
                {/* Image preview */}
                <AnimatePresence>
                    {image && (
                        <Motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full left-4 sm:left-10 mb-4"
                        >
                            <div className="relative p-1 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700">
                                <img src={imagePreview} alt="preview" className="h-32 w-32 sm:h-40 sm:w-40 object-cover rounded-xl" />
                                <button
                                    onClick={() => {
                                        setImage(null);
                                        setImagePreview(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors border-2 border-white dark:border-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>

                {/* Main Input Container */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl px-2 py-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/40 dark:border-slate-800/40 transition-all focus-within:shadow-[0_8px_40px_rgb(0,0,0,0.16)] dark:focus-within:border-purple-500/30">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        {/* Image upload */}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-purple-600 transition-all shrink-0 dark:hover:bg-slate-800 dark:text-slate-500 dark:hover:text-purple-400"
                        >
                            <ImagePlus className="w-[20px] h-[20px]" />
                        </button>

                        {/* Text input */}
                        <div className="flex-1 min-w-0">
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Message..."
                                className="w-full px-2 py-2.5 bg-transparent text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 border-none focus:outline-none focus:ring-0"
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 pr-1">
                            <button
                                onClick={sendMessage}
                                disabled={sending || (!text.trim() && !image)}
                                className={`
                                    w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95
                                    ${(text.trim() || image) && !sending
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/35 hover:bg-purple-700 hover:shadow-purple-500/50'
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                    }
                                `}
                            >
                                <Send className={`w-[18px] h-[18px] transition-transform ${text.trim() && 'translate-x-0.5 -translate-y-0.5'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
