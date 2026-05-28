import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ImagePlus, Send, X, MoreVertical, Phone, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import {
    CallControls,
    SpeakerLayout,
    StreamCall,
    StreamVideo,
    StreamVideoClient
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

const ActiveCall = ({ client, call, onLeave }) => (
    <StreamVideo client={client}>
        <StreamCall call={call}>
            <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col">
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">Ping-up call</p>
                        <p className="text-xs text-slate-400">Encrypted by Stream</p>
                    </div>
                    <button
                        onClick={onLeave}
                        className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
                        aria-label="Close call"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex-1 min-h-0">
                    <SpeakerLayout />
                </div>

                <div className="px-4 py-4 border-t border-white/10 flex justify-center">
                    <CallControls onLeave={onLeave} />
                </div>
            </div>
        </StreamCall>
    </StreamVideo>
);

const ChatBox = () => {
    const { userid } = useParams();
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [callClient, setCallClient] = useState(null);
    const [activeCall, setActiveCall] = useState(null);
    const [callLoading, setCallLoading] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
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

    useEffect(() => {
        const handleIncomingCall = (event) => {
            const data = event.detail;
            const fromUserId = typeof data.from_user_id === "object" ? data.from_user_id._id : data.from_user_id;

            if (fromUserId === userid) {
                setIncomingCall(data);
            }
        };

        window.addEventListener('incoming-call', handleIncomingCall);

        return () => window.removeEventListener('incoming-call', handleIncomingCall);
    }, [userid]);

    const sendMessage = async () => {
        if (!text.trim() && !image) {
            return;
        }

        const messageText = text.trim();
        const currentImage = image;
        const currentImagePreview = imagePreview;

        // Optimistic message
        const optimisticMessage = {
            _id: `temp-${Date.now()}`,
            from_user_id: currentUser,
            to_user_id: userid,
            text: messageText,
            media_url: currentImagePreview,
            message_type: currentImage ? 'image' : 'text',
            createdAt: new Date().toISOString(),
            isOptimistic: true
        };

        // Add to UI immediately
        setMessages((prev) => [...prev, optimisticMessage]);
        
        // Clear inputs immediately
        setText("");
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append("to_user_id", userid);
            formData.append("text", messageText);

            if (currentImage) {
                formData.append("media", currentImage);
                formData.append("media_type", "image");
            }

            const { data } = await api.post('/api/message/send', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                throw new Error(data.message);
            }

            // Replace optimistic message with the real one from server
            setMessages((prev) => prev.map(msg => 
                msg._id === optimisticMessage._id ? { 
                    ...data.message, 
                    from_user_id: currentUser, 
                    to_user_id: userid 
                } : msg
            ));

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || error.message || "Failed to send message");
            // Remove optimistic message on failure
            setMessages((prev) => prev.filter(msg => msg._id !== optimisticMessage._id));
            // Restore text
            setText(messageText);
            if (currentImage) {
                setImage(currentImage);
                setImagePreview(currentImagePreview);
            }
        }
    }

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const leaveCall = useCallback(async () => {
        const callToLeave = activeCall;
        const clientToDisconnect = callClient;

        setActiveCall(null);
        setCallClient(null);
        setCallLoading(false);

        try {
            await callToLeave?.leave();
        } catch (error) {
            console.warn("Failed to leave Stream call", error);
        }

        try {
            await clientToDisconnect?.disconnectUser();
        } catch (error) {
            console.warn("Failed to disconnect Stream client", error);
        }
    }, [activeCall, callClient]);

    useEffect(() => {
        return () => {
            activeCall?.leave().catch((error) => console.warn("Failed to leave Stream call", error));
            callClient?.disconnectUser().catch((error) => console.warn("Failed to disconnect Stream client", error));
        };
    }, [activeCall, callClient]);

    const startCall = async (callKind, options = {}) => {
        if (callLoading || activeCall || !currentUser?._id || !userid) return;

        setCallLoading(true);
        let streamClient;
        let call;

        try {
            const token = await getToken();
            const { data } = await api.post('/api/message/call-token', { to_user_id: userid }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!data.success) {
                throw new Error(data.message);
            }

            streamClient = new StreamVideoClient({
                apiKey: data.apiKey,
                user: data.user,
                token: data.token
            });
            call = streamClient.call(data.callType, data.callId);

            await call.join({
                create: true,
                ring: options.sendInvite !== false,
                notify: options.sendInvite !== false,
                video: callKind === 'video',
                data: {
                    members: [
                        { user_id: currentUser._id },
                        { user_id: userid }
                    ],
                    created_by_id: currentUser._id
                }
            });

            setCallClient(streamClient);
            setActiveCall(call);
            setIncomingCall(null);

            if (options.sendInvite !== false) {
                api.post('/api/message/call-invite', { to_user_id: userid, call_kind: callKind }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch((error) => {
                    console.warn("Failed to send call invite", error);
                });
            }
        } catch (error) {
            call?.leave().catch(() => {});
            streamClient?.disconnectUser().catch(() => {});
            toast.error(error.response?.data?.message || error.message || "Failed to start call");
        } finally {
            setCallLoading(false);
        }
    };

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
                    <button
                        onClick={() => startCall('audio')}
                        disabled={callLoading || !!activeCall}
                        title="Start audio call"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <Phone className="w-[18px] h-[18px]" />
                    </button>
                    <button
                        onClick={() => startCall('video')}
                        disabled={callLoading || !!activeCall}
                        title="Start video call"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <Video className="w-[18px] h-[18px]" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-800 dark:hover:text-slate-200">
                        <MoreVertical className="w-[18px] h-[18px]" />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {incomingCall && !activeCall && !callLoading && (
                    <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-20 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-30 rounded-2xl bg-white border border-slate-200 shadow-xl px-4 py-3 flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800"
                    >
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 dark:bg-purple-500/15 dark:text-purple-300">
                            {incomingCall.call_kind === 'video' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 truncate dark:text-slate-100">
                                Incoming {incomingCall.call_kind} call
                            </p>
                            <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                                {user.full_name}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIncomingCall(null)}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                aria-label="Decline call"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => startCall(incomingCall.call_kind, { sendInvite: false })}
                                className="w-9 h-9 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                                aria-label="Accept call"
                            >
                                {incomingCall.call_kind === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                            </button>
                        </div>
                    </Motion.div>
                )}

                {callLoading && (
                    <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-slate-950/90 text-white text-xs font-semibold shadow-lg"
                    >
                        Connecting call...
                    </Motion.div>
                )}
            </AnimatePresence>

            {callClient && activeCall && (
                <ActiveCall client={callClient} call={activeCall} onLeave={leaveCall} />
            )}

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
                                disabled={!text.trim() && !image}
                                className={`
                                    w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95
                                    ${(text.trim() || image)
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
