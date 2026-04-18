import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ImagePlus, Send, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const ChatBox = () => {
    const { userid } = useParams();
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChat = async () => {
            try {
                const token = await getToken();
                const [profileResponse, messagesResponse] = await Promise.all([
                    api.post('/api/user/profiles', { profileId: userid }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    api.post('/api/message/get', { to_user_id: userid }, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (profileResponse.data.success) {
                    setUser(profileResponse.data.profile);
                } else {
                    throw new Error(profileResponse.data.message);
                }

                if (messagesResponse.data.success) {
                    setMessages([...(messagesResponse.data.messages || [])].reverse());
                } else {
                    throw new Error(messagesResponse.data.message);
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

        const eventSource = new EventSource(`${api.defaults.baseURL}/api/message/sse/${currentUser._id}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === "connected") return;

            const fromUserId = typeof data.from_user_id === "object" ? data.from_user_id._id : data.from_user_id;
            if (fromUserId === userid) {
                setMessages((prev) => [...prev, data]);
            }
        };

        return () => eventSource.close();
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
        <div className="flex-1 min-h-0 w-full flex flex-col bg-linear-to-b from-purple-50/60 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-purple-100/60 px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4 dark:bg-slate-950/80 dark:border-slate-800/80">
                <button
                    onClick={() => navigate('/messages')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors shrink-0 dark:bg-purple-500/20 dark:hover:bg-purple-500/30 dark:text-purple-400"
                >
                    <ArrowLeft className="w-[18px] h-[18px]" />
                </button>

                <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-purple-200/60 shadow-sm shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-slate-800 text-[15px] sm:text-base leading-tight truncate dark:text-slate-100">
                        {user.full_name}
                    </h2>
                    <p className="text-xs text-purple-400 truncate dark:text-purple-500">@{user.username}</p>
                </div>

                {/* Online indicator */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"></span>
                    <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Online</span>
                </div>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-4 sm:px-6 py-4 sm:py-6 space-y-1">
                {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
                    <div key={dateKey}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-5">
                            <div className="px-3.5 py-1 rounded-full bg-purple-100/70 text-[11px] font-semibold text-purple-500 tracking-wide uppercase shadow-sm dark:bg-purple-900/40 dark:text-purple-400 dark:shadow-none">
                                {formatDate(msgs[0].createdAt)}
                            </div>
                        </div>

                        {/* Messages for this date */}
                        {msgs.map((message, index) => {
                            const fromUserId = typeof message.from_user_id === "object" ? message.from_user_id._id : message.from_user_id;
                            const isSent = fromUserId === currentUser?._id;
                            const isImage = message.message_type === 'image';

                            return (
                                <div
                                    key={message._id || index}
                                    className={`flex mb-2.5 ${isSent ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[75%] sm:max-w-[65%] group`}>
                                        {/* Bubble */}
                                        <div
                                            className={`
                                                relative rounded-2xl px-4 py-2.5 shadow-sm transition-shadow
                                                ${isSent
                                                    ? 'bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-br-md dark:from-purple-600 dark:to-purple-700'
                                                    : 'bg-white text-slate-700 border border-purple-100/50 rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:shadow-none'
                                                }
                                            `}
                                        >
                                            {isImage && message.media_url && (
                                                <img
                                                    src={message.media_url}
                                                    alt="shared"
                                                    className="rounded-xl mb-2 max-h-60 w-full object-cover"
                                                />
                                            )}
                                            {message.text && (
                                                <p className={`text-[14px] sm:text-[14.5px] leading-relaxed ${isSent ? 'text-white' : 'text-slate-700'}`}>
                                                    {message.text}
                                                </p>
                                            )}
                                        </div>

                                        {/* Timestamp */}
                                        <p className={`text-[10px] mt-1 px-1 text-slate-400 ${isSent ? 'text-right' : 'text-left'} dark:text-slate-500`}>
                                            {formatTime(message.createdAt)}
                                            {isSent && message.seen && (
                                                <span className="ml-1.5 text-purple-400">✓✓</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Image preview ── */}
            {image && (
                <div className="px-4 sm:px-6 pb-2">
                    <div className="relative inline-block">
                        <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover rounded-xl border-2 border-purple-200 shadow-sm" />
                        <button
                            onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                                if (fileInputRef.current) {
                                    fileInputRef.current.value = "";
                                }
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Input Bar ── */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-purple-100/50 px-4 sm:px-6 py-3 dark:bg-slate-950/90 dark:border-slate-800">
                <div className="flex items-center gap-2.5 sm:gap-3 max-w-full">
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
                        className="w-10 h-10 flex items-center justify-center border border-purple-300 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 hover:text-purple-600 transition-all shrink-0 dark:border-purple-800 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
                    >
                        <ImagePlus className="w-[18px] h-[18px]" />
                    </button>

                    {/* Text input */}
                    <div className="flex-1 min-w-0">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            className="w-full px-4 py-2.5 rounded-xl bg-purple-50/70 border border-purple-300 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50 focus:border-purple-200 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-purple-500/50 dark:focus:border-purple-500"
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={sendMessage}
                        disabled={sending || (!text.trim() && !image)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-br from-purple-500 to-purple-600 text-white shadow-[0_2px_10px_rgba(147,51,234,0.35)] hover:shadow-[0_4px_16px_rgba(147,51,234,0.45)] hover:scale-[1.03] active:scale-95 transition-all shrink-0"
                    >
                        <Send className="w-[18px] h-[18px]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatBox;
