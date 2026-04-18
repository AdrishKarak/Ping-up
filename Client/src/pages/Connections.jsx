import React, { useCallback, useEffect, useState } from 'react';
import { Users, UserPlus, UserCheck, UserRoundPen, MessageCircle } from 'lucide-react'
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

            if (data.success) {
                toast.success(data.message);
                fetchConnections();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to accept connection");
        }
    }

    const handleUnfollow = async (id) => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/unfollow', { id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                fetchConnections();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to unfollow user");
        }
    }

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const dataArry = [
        { label: 'Followers', value: followers, icon: Users },
        { label: 'Following', value: following, icon: UserPlus },
        { label: 'Requests', value: pendingConnections, icon: UserCheck },
        { label: 'Connections', value: connections, icon: UserRoundPen },
    ];

    const currentData = dataArry.find(item => item.label === currentTab)?.value || [];

    return loading ? <Loading /> : (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-full max-w-[900px] flex flex-col">
                <div className="mb-6 md:mb-8 pl-1">
                    <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 mb-1.5 tracking-tight dark:text-slate-100">Connections</h1>
                    <p className="text-slate-500 text-[13px] md:text-sm dark:text-slate-400">Accept incoming requests, message connections, and manage follows</p>
                </div>

                {pendingConnections.length > 0 && currentTab !== 'Requests' && (
                    <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 dark:bg-indigo-900/20 dark:border-indigo-800/50">
                        <div>
                            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300">Incoming connection requests</p>
                            <p className="text-xs text-indigo-600 mt-0.5 dark:text-indigo-400">{pendingConnections.length} waiting for your response</p>
                        </div>
                        <button
                            onClick={() => setCurrentTab('Requests')}
                            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Review requests
                        </button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-8">
                    {dataArry.map((item) => (
                        <div 
                            key={item.label} 
                            onClick={() => setCurrentTab(item.label)}
                            className={`bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none ${currentTab === item.label ? 'ring-2 ring-purple-500 shadow-md scale-[1.02] dark:ring-purple-600' : 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] dark:hover:shadow-none dark:hover:bg-slate-800'}`}
                        >
                            <h2 className="text-[22px] md:text-2xl font-bold text-slate-800 mb-1 dark:text-slate-100">{item.value.length}</h2>
                            <p className="text-[13px] sm:text-sm text-slate-500 font-medium dark:text-slate-400">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="w-full mb-6 border-b border-slate-200 shrink-0 dark:border-slate-800">
                    <div className="flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar min-h-[44px]">
                        {dataArry.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setCurrentTab(tab.label)}
                                className={`shrink-0 flex items-center gap-2 pb-3 px-2 text-[13px] md:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                                    currentTab === tab.label
                                        ? 'text-slate-900 border-slate-900 dark:text-slate-100 dark:border-slate-100'
                                        : 'text-slate-500 hover:text-slate-700 border-transparent dark:text-slate-400 dark:hover:text-slate-300'
                                }`}
                            >
                                <tab.icon className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Connection Grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 pb-10">
                    {currentData.map((user) => (
                        <div key={user._id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:shadow-none dark:shadow-none">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <img src={user.profile_picture} alt={user.full_name} className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full object-cover shadow-sm bg-slate-100 shrink-0 dark:bg-slate-800" />
                                <div className="flex-1 min-w-0 pr-1">
                                    <h3 className="font-semibold text-slate-800 text-[14px] sm:text-[15px] truncate dark:text-slate-100">{user.full_name}</h3>
                                    <p className="text-[12px] sm:text-[13px] text-slate-500 mb-0.5 truncate dark:text-slate-400">@{user.username}</p>
                                    <p className="text-[12px] sm:text-[13px] text-slate-600 truncate dark:text-slate-400">{user.bio}</p>
                                </div>
                                {(currentTab === 'Followers' || currentTab === 'Following') && (
                                    <button
                                        onClick={() => navigate(`/messages/${user._id}`)}
                                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors shrink-0 dark:hover:bg-purple-900/30 dark:hover:text-purple-400"
                                        title="Message"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button 
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="flex-1 bg-[#a111ff] hover:bg-[#920ee8] text-white py-2.5 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center"
                                >
                                    View Profile
                                </button>
                                
                                {currentTab === 'Following' && (
                                    <button onClick={() => handleUnfollow(user._id)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300">
                                        Unfollow
                                    </button>
                                )}
                                {currentTab === 'Requests' && (
                                    <button onClick={() => handleAccept(user._id)} className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 dark:text-indigo-300">
                                        Accept
                                    </button>
                                )}
                                {currentTab === 'Connections' && (
                                    <button 
                                        onClick={() => navigate(`/messages/${user._id}`)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                                    >
                                        Message
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {currentData.length === 0 && (
                        <div className="col-span-full py-12 text-center flex flex-col items-center">
                            <span className="text-slate-400 mb-2">
                                <UserCheck className="w-12 h-12 opacity-50" />
                            </span>
                            <p className="text-slate-500 text-[15px]">No users found in this category.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Connections;
