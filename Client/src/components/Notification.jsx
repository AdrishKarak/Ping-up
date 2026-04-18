import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, MessageSquareReply } from 'lucide-react';
import { clearNotification } from '../features/messages/messagesSlice';

const Notification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { latestMessage, showNotification } = useSelector((state) => state.messages);

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                dispatch(clearNotification());
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [showNotification, dispatch]);

    if (!showNotification || !latestMessage) return null;

    const fromUser = latestMessage.from_user_id;
    const isChattingWithThisUser = location.pathname === `/messages/${fromUser._id}`;

    // If the user is already in the chat with this person, don't show the notification
    if (isChattingWithThisUser) {
        return null;
    }

    const handleReply = () => {
        navigate(`/messages/${fromUser._id}`);
        dispatch(clearNotification());
    };

    return (
        <div className="fixed top-4 right-4 z-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/30 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-4 flex items-start gap-4 min-w-[320px] max-w-[400px]">
                <img
                    src={fromUser.profile_picture}
                    alt={fromUser.full_name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-50 dark:ring-purple-900/20"
                />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">
                            {fromUser.full_name}
                        </h4>
                        <button
                            onClick={() => dispatch(clearNotification())}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                        {latestMessage.message_type === 'image' ? 'Sent an image' : latestMessage.text}
                    </p>

                    <button
                        onClick={handleReply}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95"
                    >
                        <MessageSquareReply className="w-3.5 h-3.5" />
                        Reply
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Notification;
