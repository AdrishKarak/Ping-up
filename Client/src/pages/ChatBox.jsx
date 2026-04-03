import React, { useRef, useState, useEffect } from 'react';
import { dummyMessagesData, dummyUserData } from '../assets/assets';
import { ArrowLeft, ImagePlus, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatBox = () => {
    const messages = dummyMessagesData;
    const [text, setText] = useState("");
    const [image, setImage] = useState(null);
    const [user, setUser] = useState(dummyUserData);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const sendMessage = async () => {
        //will make this after making backend . Dont touch this AI
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
            setImage(URL.createObjectURL(file));
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

    return (
        <div className="h-full w-full flex flex-col bg-linear-to-b from-purple-50/60 via-white to-white">
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-purple-100/60 px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-4">
                <button
                    onClick={() => navigate('/messages')}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors shrink-0"
                >
                    <ArrowLeft className="w-[18px] h-[18px]" />
                </button>

                <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-purple-200/60 shadow-sm shrink-0"
                />

                <div className="min-w-0 flex-1">
                    <h2 className="font-bold text-slate-800 text-[15px] sm:text-base leading-tight truncate">
                        {user.full_name}
                    </h2>
                    <p className="text-xs text-purple-400 truncate">@{user.username}</p>
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
                            <div className="px-3.5 py-1 rounded-full bg-purple-100/70 text-[11px] font-semibold text-purple-500 tracking-wide uppercase shadow-sm">
                                {formatDate(msgs[0].createdAt)}
                            </div>
                        </div>

                        {/* Messages for this date */}
                        {msgs.map((message, index) => {
                            const isSent = message.from_user_id === user._id;
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
                                                    ? 'bg-linear-to-br from-purple-500 to-purple-600 text-white rounded-br-md'
                                                    : 'bg-white text-slate-700 border border-purple-100/50 rounded-bl-md shadow-[0_1px_4px_rgba(0,0,0,0.04)]'
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
                                        <p className={`text-[10px] mt-1 px-1 text-slate-400 ${isSent ? 'text-right' : 'text-left'}`}>
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
                        <img src={image} alt="preview" className="h-20 w-20 object-cover rounded-xl border-2 border-purple-200 shadow-sm" />
                        <button
                            onClick={() => setImage(null)}
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* ── Input Bar ── */}
            <div className="sticky bottom-0 bg-white/90 backdrop-blur-xl border-t border-purple-100/50 px-4 sm:px-6 py-3">
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
                        className="w-10 h-10 flex items-center justify-center border border-purple-300 rounded-xl bg-purple-50 text-purple-500 hover:bg-purple-100 hover:text-purple-600 transition-all shrink-0"
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
                            className="w-full px-4 py-2.5 rounded-xl bg-purple-50/70 border border-purple-300 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50 focus:border-purple-200 transition-all"
                        />
                    </div>

                    {/* Send button */}
                    <button
                        onClick={sendMessage}
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