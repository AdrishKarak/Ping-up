import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ImageIcon, MessageSquare, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '@clerk/react';
import { useSelector } from 'react-redux';
import api from '../api/axios';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Messages = () => {
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user.value);
    const [people, setPeople] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { getToken } = useAuth();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const token = await getToken();
                const [connectionsResponse, recentResponse] = await Promise.all([
                    api.get('/api/user/connections', { headers: { Authorization: `Bearer ${token}` } }),
                    api.get('/api/user/recent-messages', { headers: { Authorization: `Bearer ${token}` } })
                ]);

                if (!connectionsResponse.data.success) throw new Error(connectionsResponse.data.message);
                if (!recentResponse.data.success) throw new Error(recentResponse.data.message);

                const conversations = recentResponse.data.messages || [];
                const connectionUsers = connectionsResponse.data.connections || [];
                const userMap = new Map();

                conversations.forEach((message) => {
                    const otherUser = message.from_user_id?._id === currentUser?._id
                        ? message.to_user_id : message.from_user_id;
                    if (otherUser?._id) userMap.set(otherUser._id, { ...otherUser, lastMessage: message });
                });

                connectionUsers.forEach((user) => {
                    if (!userMap.has(user._id)) userMap.set(user._id, { ...user, lastMessage: null });
                });

                setPeople(Array.from(userMap.values()));
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to load conversations");
            } finally {
                setLoading(false);
            }
        };
        if (currentUser?._id) fetchConversations();
    }, [getToken, currentUser?._id]);

    const getPreview = (message) => {
        if (!message) return null;
        if (message.text) return message.text;
        if (message.media_url) return "📷 Image";
        return "Sent a message";
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const filtered = people.filter(u =>
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    const unread = filtered.filter(u =>
        u.lastMessage?.seen === false && u.lastMessage?.to_user_id === currentUser?._id
    );
    const rest = filtered.filter(u =>
        !(u.lastMessage?.seen === false && u.lastMessage?.to_user_id === currentUser?._id)
    );

    if (loading) return <Loading />;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

                .msg-root {
                    font-family: 'DM Sans', sans-serif;
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                    background: #f5f4f0;
                    scrollbar-width: none;
                }
                .dark .msg-root {
                    background: #080c18;
                }
                .msg-root::-webkit-scrollbar { display: none; }

                .msg-inner {
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 40px 20px 60px;
                }

                .msg-header {
                    margin-bottom: 32px;
                }

                .msg-title {
                    font-family: 'Sora', sans-serif;
                    font-size: clamp(28px, 5vw, 38px);
                    font-weight: 800;
                    color: #0f0f12;
                    line-height: 1;
                    letter-spacing: -1.5px;
                    margin: 0 0 6px 0;
                }
                .dark .msg-title { color: #f2f0ec; }

                .msg-subtitle {
                    font-size: 14px;
                    font-weight: 400;
                    color: #888;
                    margin: 0 0 28px 0;
                    letter-spacing: 0;
                }

                .search-wrap {
                    position: relative;
                }
                .search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #aaa;
                    width: 16px;
                    height: 16px;
                    pointer-events: none;
                    transition: color 0.2s;
                }
                .search-input {
                    width: 100%;
                    padding: 12px 16px 12px 42px;
                    border-radius: 14px;
                    border: 1.5px solid #e5e3de;
                    background: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 14px;
                    color: #0f0f12;
                    outline: none;
                    transition: all 0.2s;
                    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
                    box-sizing: border-box;
                }
                .dark .search-input {
                    background: #0e1526;
                    border-color: #1a2540;
                    color: #f2f0ec;
                }
                .search-input::placeholder { color: #b0aca5; }
                .dark .search-input::placeholder { color: #55545e; }
                .search-input:focus {
                    border-color: #7c5cfc;
                    box-shadow: 0 0 0 4px rgba(124, 92, 252, 0.08);
                }
                .search-wrap:focus-within .search-icon { color: #7c5cfc; }

                .section-label {
                    font-family: 'Sora', sans-serif;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 1.8px;
                    text-transform: uppercase;
                    color: #aaa;
                    margin: 28px 0 12px;
                    padding-left: 2px;
                }

                .msg-list {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .msg-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 16px;
                    border-radius: 18px;
                    background: #fff;
                    border: 1.5px solid #eeece8;
                    cursor: pointer;
                    transition: all 0.18s ease;
                    position: relative;
                    overflow: hidden;
                }
                .dark .msg-card {
                    background: #0e1526;
                    border-color: #1a2540;
                }
                .msg-card:hover {
                    border-color: #c4b5fd;
                    background: #fdfbff;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 24px rgba(124, 92, 252, 0.08);
                }
                .dark .msg-card:hover {
                    background: #131d35;
                    border-color: #4c3d99;
                    box-shadow: 0 6px 24px rgba(124, 92, 252, 0.15);
                }
                .msg-card.unread {
                    background: #faf8ff;
                    border-color: #d8ccff;
                }
                .dark .msg-card.unread {
                    background: #0d1428;
                    border-color: #2d3f7a;
                }

                /* Unread left accent bar */
                .msg-card.unread::before {
                    content: '';
                    position: absolute;
                    left: 0; top: 20%; bottom: 20%;
                    width: 3px;
                    background: #7c5cfc;
                    border-radius: 0 2px 2px 0;
                }

                .avatar-wrap {
                    position: relative;
                    flex-shrink: 0;
                }
                .avatar {
                    width: 50px;
                    height: 50px;
                    border-radius: 14px;
                    object-fit: cover;
                    display: block;
                    background: #e5e3de;
                }
                .dark .avatar { background: #2a2a35; }
                .online-dot {
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: #22c55e;
                    border: 2px solid #fff;
                    border-radius: 50%;
                }
                .dark .online-dot { border-color: #16161d; }

                .msg-body {
                    flex: 1;
                    min-width: 0;
                }
                .msg-top {
                    display: flex;
                    align-items: baseline;
                    justify-content: space-between;
                    gap: 8px;
                    margin-bottom: 2px;
                }
                .msg-name {
                    font-family: 'Sora', sans-serif;
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f0f12;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .dark .msg-name { color: #f2f0ec; }
                .msg-time {
                    font-size: 11px;
                    font-weight: 500;
                    color: #bbb;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .msg-username {
                    font-size: 12px;
                    color: #aaa;
                    margin-bottom: 4px;
                    font-weight: 400;
                }
                .msg-preview {
                    font-size: 13.5px;
                    color: #888;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: 400;
                }
                .msg-preview.bold {
                    color: #0f0f12;
                    font-weight: 600;
                }
                .dark .msg-preview.bold { color: #f2f0ec; }
                .msg-preview.muted {
                    color: #c0bdb8;
                    font-style: italic;
                }

                .unread-badge {
                    width: 8px;
                    height: 8px;
                    background: #7c5cfc;
                    border-radius: 50%;
                    flex-shrink: 0;
                    margin-left: 4px;
                    align-self: center;
                }

                .msg-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    flex-shrink: 0;
                    opacity: 0;
                    transform: translateX(6px);
                    transition: all 0.18s ease;
                }
                .msg-card:hover .msg-actions {
                    opacity: 1;
                    transform: translateX(0);
                }
                @media (max-width: 500px) {
                    .msg-actions { opacity: 1; transform: none; }
                }
                .action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                    flex-shrink: 0;
                }
                .action-btn:hover { transform: scale(1.07); }
                .action-btn:active { transform: scale(0.95); }
                .action-btn.primary {
                    background: #7c5cfc;
                    color: #fff;
                    box-shadow: 0 4px 12px rgba(124, 92, 252, 0.3);
                }
                .action-btn.primary:hover { background: #6b4ef0; }
                .action-btn.secondary {
                    background: #f0ede8;
                    color: #666;
                }
                .dark .action-btn.secondary {
                    background: #1a2540;
                    color: #8899bb;
                }
                .action-btn.secondary:hover {
                    background: #e8e4de;
                    color: #333;
                }
                .dark .action-btn.secondary:hover {
                    background: #1f2d4e;
                    color: #ccd6f0;
                }

                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                }
                .empty-icon {
                    width: 56px;
                    height: 56px;
                    background: #f0edff;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    color: #7c5cfc;
                }
                .dark .empty-icon { background: #0e1a35; }
                .dark .online-dot { border-color: #0e1526; }
                .empty-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f0f12;
                    margin: 0 0 8px;
                }
                .dark .empty-title { color: #f2f0ec; }
                .empty-desc {
                    font-size: 14px;
                    color: #aaa;
                    max-width: 260px;
                    margin: 0 auto;
                    line-height: 1.6;
                }
            `}</style>

            <div className="msg-root">
                <div className="msg-inner">
                    {/* Header */}
                    <div className="msg-header">
                        <h1 className="msg-title">Messages</h1>
                        <p className="msg-subtitle">Stay connected with your network</p>
                        <div className="search-wrap">
                            <Search className="search-icon" />
                            <input
                                className="search-input"
                                type="text"
                                placeholder="Search people..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {filtered.length === 0 ? (
                        <Motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="empty-state"
                        >
                            <div className="empty-icon">
                                <MessageSquare size={24} />
                            </div>
                            <p className="empty-title">No conversations yet</p>
                            <p className="empty-desc">Connect with people and start chatting. They'll show up here.</p>
                        </Motion.div>
                    ) : (
                        <>
                            {unread.length > 0 && (
                                <>
                                    <p className="section-label">Unread</p>
                                    <div className="msg-list">
                                        <AnimatePresence>
                                            {unread.map((user, i) => (
                                                <ConvoCard
                                                    key={user._id}
                                                    user={user}
                                                    index={i}
                                                    currentUser={currentUser}
                                                    isUnread
                                                    getPreview={getPreview}
                                                    formatTime={formatTime}
                                                    navigate={navigate}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}

                            {rest.length > 0 && (
                                <>
                                    <p className="section-label">{unread.length > 0 ? 'All messages' : 'Messages'}</p>
                                    <div className="msg-list">
                                        <AnimatePresence>
                                            {rest.map((user, i) => (
                                                <ConvoCard
                                                    key={user._id}
                                                    user={user}
                                                    index={i + unread.length}
                                                    currentUser={currentUser}
                                                    getPreview={getPreview}
                                                    formatTime={formatTime}
                                                    navigate={navigate}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

const ConvoCard = ({ user, index, currentUser, isUnread, getPreview, formatTime, navigate }) => {
    const preview = getPreview(user.lastMessage);
    const time = formatTime(user.lastMessage?.createdAt);

    return (
        <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ delay: index * 0.04, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={`msg-card${isUnread ? ' unread' : ''}`}
            onClick={() => navigate(`/messages/${user._id}`)}
        >
            <div className="avatar-wrap">
                <img
                    src={user.profile_picture}
                    alt={user.full_name}
                    className="avatar"
                />
                {user.isOnline && <div className="online-dot" />}
            </div>

            <div className="msg-body">
                <div className="msg-top">
                    <span className="msg-name">{user.full_name}</span>
                    {time && <span className="msg-time">{time}</span>}
                </div>
                <p className="msg-username">@{user.username}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <p className={`msg-preview${isUnread ? ' bold' : preview ? '' : ' muted'}`}>
                        {preview ?? 'Start a conversation'}
                    </p>
                    {isUnread && <div className="unread-badge" />}
                </div>
            </div>

            <div className="msg-actions">
                <button
                    className="action-btn primary"
                    title="Open chat"
                    onClick={e => { e.stopPropagation(); navigate(`/messages/${user._id}`); }}
                >
                    <ArrowRight size={16} />
                </button>
                <button
                    className="action-btn secondary"
                    title="View profile"
                    onClick={e => { e.stopPropagation(); navigate(`/profile/${user._id}`); }}
                >
                    <Eye size={16} />
                </button>
            </div>
        </Motion.div>
    );
};

export default Messages;