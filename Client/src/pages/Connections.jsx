import React, { useCallback, useEffect, useState } from 'react';
import { Users, UserPlus, UserCheck, UserRoundPen, MessageCircle, Bell } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

const Connections = () => {
    const navigate = useNavigate();
    const { getToken } = useAuth();
    const [currentTab, setCurrentTab] = useState('Requests');
    const [connections, setConnections] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [pendingConnections, setPendingConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchConnections = useCallback(async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/user/connections', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setConnections(data.connections || []);
                setFollowers(data.followers || []);
                setFollowing(data.following || []);
                setPendingConnections(data.pendingConnections || []);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to load connections");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    const handleAccept = async (id) => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/accept', { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) { toast.success(data.message); fetchConnections(); }
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to accept connection");
        }
    };

    const handleUnfollow = async (id) => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/unfollow', { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) { toast.success(data.message); fetchConnections(); }
            else toast.error(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to unfollow user");
        }
    };

    useEffect(() => { fetchConnections(); }, [fetchConnections]);

    const dataArry = [
        { label: 'Followers', value: followers, icon: Users },
        { label: 'Following', value: following, icon: UserPlus },
        { label: 'Requests', value: pendingConnections, icon: UserCheck },
        { label: 'Connections', value: connections, icon: UserRoundPen },
    ];

    const currentData = dataArry.find(item => item.label === currentTab)?.value || [];

    if (loading) return <Loading />;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                .cn-root {
                    font-family: 'DM Sans', sans-serif;
                    flex: 1; min-height: 0; overflow-y: auto;
                    background: #f0eee9;
                    scrollbar-width: none;
                    padding: 28px 16px 60px;
                    box-sizing: border-box;
                }
                .dark .cn-root { background: #080c18; }
                .cn-root::-webkit-scrollbar { display: none; }

                .cn-inner { max-width: 860px; margin: 0 auto; }

                /* Header */
                .cn-header { margin-bottom: 24px; }
                .cn-title {
                    font-family: 'Sora', sans-serif;
                    font-size: clamp(26px, 5vw, 36px);
                    font-weight: 800; color: #0f0f12;
                    letter-spacing: -1.2px; margin: 0 0 5px;
                }
                .dark .cn-title { color: #f2f0ec; }
                .cn-subtitle { font-size: 14px; color: #aaa; margin: 0; font-weight: 400; }

                /* Pending banner */
                .cn-banner {
                    display: flex; align-items: center; justify-content: space-between;
                    gap: 12px; padding: 14px 18px;
                    background: #ede9ff; border: 1.5px solid #c4b5fd;
                    border-radius: 16px; margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .dark .cn-banner { background: #1a1535; border-color: #3d2f7a; }
                .cn-banner-text { font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700; color: #5b21b6; }
                .dark .cn-banner-text { color: #c4b5fd; }
                .cn-banner-sub { font-size: 12px; color: #7c5cfc; margin-top: 2px; }
                .dark .cn-banner-sub { color: #9d7dfd; }
                .cn-banner-btn {
                    padding: 8px 18px; border-radius: 50px; border: none;
                    background: #7c5cfc; color: #fff;
                    font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 700;
                    cursor: pointer; transition: all 0.15s;
                    white-space: nowrap;
                    display: flex; align-items: center; gap: 6px;
                }
                .cn-banner-btn:hover { background: #6b4ef0; transform: translateY(-1px); }

                /* Stat cards */
                .cn-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
                @media (max-width: 500px) { .cn-stats { grid-template-columns: repeat(2, 1fr); } }

                .cn-stat {
                    background: #fff; border: 1.5px solid #e2dfd8;
                    border-radius: 18px; padding: 16px 12px;
                    display: flex; flex-direction: column; align-items: center;
                    cursor: pointer; transition: all 0.18s;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                    position: relative; overflow: hidden;
                }
                .dark .cn-stat { background: #0e1526; border-color: #1a2540; box-shadow: none; }
                .cn-stat:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.07); }
                .dark .cn-stat:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.3); border-color: #2a3a5e; }
                .cn-stat.active {
                    border-color: #7c5cfc;
                    box-shadow: 0 0 0 3px rgba(124,92,252,0.12), 0 4px 16px rgba(124,92,252,0.1);
                }
                .dark .cn-stat.active { box-shadow: 0 0 0 3px rgba(124,92,252,0.2); }

                .cn-stat-num {
                    font-family: 'Sora', sans-serif;
                    font-size: 24px; font-weight: 800;
                    color: #0f0f12; line-height: 1;
                    margin-bottom: 4px;
                }
                .dark .cn-stat-num { color: #f2f0ec; }
                .cn-stat.active .cn-stat-num { color: #7c5cfc; }

                .cn-stat-label { font-size: 12px; color: #aaa; font-weight: 500; }
                .cn-stat.active .cn-stat-label { color: #9d7dfd; }

                /* Tabs */
                .cn-tabs {
                    display: flex; gap: 4px;
                    border-bottom: 1.5px solid #e2dfd8;
                    margin-bottom: 20px; overflow-x: auto;
                    scrollbar-width: none;
                }
                .dark .cn-tabs { border-color: #1a2540; }
                .cn-tabs::-webkit-scrollbar { display: none; }

                .cn-tab {
                    display: flex; align-items: center; gap: 7px;
                    padding: 10px 16px 12px; border: none; background: none;
                    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
                    color: #aaa; cursor: pointer; white-space: nowrap;
                    border-bottom: 2px solid transparent; margin-bottom: -1.5px;
                    transition: all 0.15s;
                }
                .cn-tab:hover { color: #555; }
                .dark .cn-tab:hover { color: #ccc; }
                .cn-tab.active {
                    color: #0f0f12; border-bottom-color: #7c5cfc;
                    font-weight: 700;
                }
                .dark .cn-tab.active { color: #f2f0ec; }

                .cn-tab-badge {
                    min-width: 18px; height: 18px; padding: 0 5px;
                    border-radius: 50px; background: #7c5cfc;
                    color: #fff; font-size: 10px; font-weight: 800;
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Sora', sans-serif;
                }

                /* Grid */
                .cn-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                @media (max-width: 560px) { .cn-grid { grid-template-columns: 1fr; } }

                /* User card */
                .cn-card {
                    background: #fff; border: 1.5px solid #e2dfd8;
                    border-radius: 20px; padding: 16px;
                    transition: all 0.18s;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
                }
                .dark .cn-card { background: #0e1526; border-color: #1a2540; box-shadow: none; }
                .cn-card:hover {
                    border-color: #c4b5fd; transform: translateY(-1px);
                    box-shadow: 0 6px 24px rgba(124,92,252,0.08);
                }
                .dark .cn-card:hover { border-color: #4c3d99; box-shadow: 0 6px 24px rgba(124,92,252,0.12); }

                .cn-card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
                .cn-card-avatar {
                    width: 48px; height: 48px; border-radius: 14px;
                    object-fit: cover; flex-shrink: 0;
                    border: 2px solid #ebe8e2; background: #eee;
                }
                .dark .cn-card-avatar { border-color: #1e2e4a; background: #1a2540; }
                .cn-card-info { flex: 1; min-width: 0; }
                .cn-card-name {
                    font-family: 'Sora', sans-serif; font-size: 14px;
                    font-weight: 700; color: #0f0f12;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                    margin-bottom: 2px;
                }
                .dark .cn-card-name { color: #f2f0ec; }
                .cn-card-handle { font-size: 12px; color: #aaa; margin-bottom: 4px; }
                .cn-card-bio {
                    font-size: 12px; color: #888; line-height: 1.4;
                    overflow: hidden; text-overflow: ellipsis;
                    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
                }
                .dark .cn-card-bio { color: #5a6a88; }

                .cn-msg-btn {
                    width: 34px; height: 34px; border-radius: 10px; border: none;
                    background: transparent; color: #bbb; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; transition: all 0.15s;
                }
                .cn-msg-btn:hover { background: rgba(124,92,252,0.1); color: #7c5cfc; }

                /* Action buttons */
                .cn-card-actions { display: flex; gap: 8px; }
                .cn-btn {
                    flex: 1; padding: 9px 12px; border-radius: 12px; border: none;
                    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
                    cursor: pointer; transition: all 0.15s; text-align: center;
                }
                .cn-btn:active { transform: scale(0.96); }

                .cn-btn-primary { background: #7c5cfc; color: #fff; box-shadow: 0 3px 10px rgba(124,92,252,0.25); }
                .cn-btn-primary:hover { background: #6b4ef0; }

                .cn-btn-ghost {
                    background: #f0eee9; color: #555;
                }
                .dark .cn-btn-ghost { background: #182035; color: #8899bb; }
                .cn-btn-ghost:hover { background: #e5e2db; }
                .dark .cn-btn-ghost:hover { background: #1f2d4a; color: #ccd6f0; }

                .cn-btn-accept { background: #ede9ff; color: #5b21b6; }
                .dark .cn-btn-accept { background: #1a1535; color: #c4b5fd; }
                .cn-btn-accept:hover { background: #ddd6fe; }
                .dark .cn-btn-accept:hover { background: #221a45; }

                /* Empty state */
                .cn-empty {
                    grid-column: 1 / -1; text-align: center;
                    padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 12px;
                }
                .cn-empty-icon {
                    width: 56px; height: 56px; border-radius: 16px;
                    background: #f0eee9; display: flex; align-items: center;
                    justify-content: center; color: #ccc;
                }
                .dark .cn-empty-icon { background: #0e1526; color: #2a3a5e; }
                .cn-empty-text { font-size: 15px; color: #aaa; }
            `}</style>

            <div className="cn-root">
                <div className="cn-inner">
                    {/* Header */}
                    <div className="cn-header">
                        <h1 className="cn-title">Connections</h1>
                        <p className="cn-subtitle">Manage your network — requests, followers, and connections</p>
                    </div>

                    {/* Pending banner */}
                    {pendingConnections.length > 0 && currentTab !== 'Requests' && (
                        <div className="cn-banner">
                            <div>
                                <div className="cn-banner-text">You have pending requests</div>
                                <div className="cn-banner-sub">{pendingConnections.length} waiting for your response</div>
                            </div>
                            <button className="cn-banner-btn" onClick={() => setCurrentTab('Requests')}>
                                <Bell size={14} /> Review
                            </button>
                        </div>
                    )}

                    {/* Stat cards */}
                    <div className="cn-stats">
                        {dataArry.map((item) => (
                            <div
                                key={item.label}
                                className={`cn-stat${currentTab === item.label ? ' active' : ''}`}
                                onClick={() => setCurrentTab(item.label)}
                            >
                                <div className="cn-stat-num">{item.value.length}</div>
                                <div className="cn-stat-label">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="cn-tabs">
                        {dataArry.map((tab) => (
                            <button
                                key={tab.label}
                                className={`cn-tab${currentTab === tab.label ? ' active' : ''}`}
                                onClick={() => setCurrentTab(tab.label)}
                            >
                                <tab.icon size={15} />
                                {tab.label}
                                {tab.label === 'Requests' && tab.value.length > 0 && (
                                    <span className="cn-tab-badge">{tab.value.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Cards grid */}
                    <div className="cn-grid">
                        {currentData.length === 0 ? (
                            <div className="cn-empty">
                                <div className="cn-empty-icon"><UserCheck size={26} /></div>
                                <p className="cn-empty-text">Nothing here yet.</p>
                            </div>
                        ) : currentData.map((user) => (
                            <div key={user._id} className="cn-card">
                                <div className="cn-card-top">
                                    <img src={user.profile_picture} alt={user.full_name} className="cn-card-avatar" />
                                    <div className="cn-card-info">
                                        <div className="cn-card-name">{user.full_name}</div>
                                        <div className="cn-card-handle">@{user.username}</div>
                                        {user.bio && <div className="cn-card-bio">{user.bio}</div>}
                                    </div>
                                    {(currentTab === 'Followers' || currentTab === 'Following') && (
                                        <button className="cn-msg-btn" onClick={() => navigate(`/messages/${user._id}`)} title="Message">
                                            <MessageCircle size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="cn-card-actions">
                                    <button className="cn-btn cn-btn-primary" onClick={() => navigate(`/profile/${user._id}`)}>
                                        View Profile
                                    </button>
                                    {currentTab === 'Following' && (
                                        <button className="cn-btn cn-btn-ghost" onClick={() => handleUnfollow(user._id)}>
                                            Unfollow
                                        </button>
                                    )}
                                    {currentTab === 'Requests' && (
                                        <button className="cn-btn cn-btn-accept" onClick={() => handleAccept(user._id)}>
                                            Accept
                                        </button>
                                    )}
                                    {currentTab === 'Connections' && (
                                        <button className="cn-btn cn-btn-ghost" onClick={() => navigate(`/messages/${user._id}`)}>
                                            Message
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Connections;