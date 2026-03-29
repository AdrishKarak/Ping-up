import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dummyConnectionsData } from '../assets/assets';
import { MessageSquare, Eye } from 'lucide-react';

const Messages = () => {
    const navigate = useNavigate();
    const [connections, setConnections] = useState([]);

    useEffect(() => {
        // Simulating fetch
        setConnections(dummyConnectionsData);
    }, []);

    return (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-full max-w-[800px] flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1.5 tracking-tight">Messages</h1>
                    <p className="text-slate-500 text-sm md:text-[15px]">Talk to your friends and family</p>
                </div>

                <div className="flex flex-col gap-4 sm:gap-6">
                    {connections.map((user) => (
                        <div
                            key={user._id}
                            className="bg-white rounded-2xl p-4 sm:p-5 flex gap-4 md:gap-5 items-start shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300"
                        >
                            {/* Avatar */}
                            <div className="shrink-0 pt-0.5">
                                <img
                                    src={user.profile_picture}
                                    alt={user.full_name}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover shadow-sm bg-slate-100"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 pr-2 md:pr-4 flex flex-col pt-0.5">
                                <h3 className="font-bold text-slate-800 text-[15px] md:text-base leading-snug truncate">
                                    {user.full_name}
                                </h3>
                                <p className="text-[13px] text-slate-500 mb-1.5 truncate">@{user.username}</p>

                                <p className="text-[13px] md:text-sm text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-wrap wrap-break-word">
                                    {user.bio}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2.5 shrink-0">
                                <button
                                    onClick={() => navigate(`/messages/${user._id}`)}
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-indigo-50/70 text-indigo-500 hover:bg-indigo-100 transition-colors"
                                    title="Message"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                                    title="View Profile"
                                >
                                    <Eye className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Messages;