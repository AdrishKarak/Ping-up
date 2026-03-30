import React, { useState } from 'react';
import {
    dummyConnectionsData as connections,
    dummyFollowersData as followers,
    dummyFollowingData as following,
    dummyPendingConnectionsData as pendingConnections
} from '../assets/assets'
import { Users, UserPlus, UserCheck, UserRoundPen } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

const Connections = () => {
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState('Followers');
    
    const dataArry = [
        { label: 'Followers', value: followers, icon: Users },
        { label: 'Following', value: following, icon: UserPlus },
        { label: 'Pending', value: pendingConnections, icon: UserCheck },
        { label: 'Connections', value: connections, icon: UserRoundPen },
    ];

    const currentData = dataArry.find(item => item.label === currentTab)?.value || [];

    return (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-full max-w-[900px] flex flex-col">
                <div className="mb-6 md:mb-8 pl-1">
                    <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 mb-1.5 tracking-tight">Connections</h1>
                    <p className="text-slate-500 text-[13px] md:text-sm">Manage your network and discover new connections</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-8">
                    {dataArry.map((item) => (
                        <div 
                            key={item.label} 
                            onClick={() => setCurrentTab(item.label)}
                            className={`bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${currentTab === item.label ? 'ring-2 ring-purple-500 shadow-md scale-[1.02]' : 'hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'}`}
                        >
                            <h2 className="text-[22px] md:text-2xl font-bold text-slate-800 mb-1">{item.value.length}</h2>
                            <p className="text-[13px] sm:text-sm text-slate-500 font-medium">{item.label}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="w-full mb-6 border-b border-slate-200 shrink-0">
                    <div className="flex gap-2 sm:gap-6 overflow-x-auto no-scrollbar min-h-[44px]">
                        {dataArry.map((tab) => (
                            <button
                                key={tab.label}
                                onClick={() => setCurrentTab(tab.label)}
                                className={`shrink-0 flex items-center gap-2 pb-3 px-2 text-[13px] md:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                                    currentTab === tab.label
                                        ? 'text-slate-900 border-slate-900'
                                        : 'text-slate-500 hover:text-slate-700 border-transparent'
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
                        <div key={user._id} className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <img src={user.profile_picture} alt={user.full_name} className="w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full object-cover shadow-sm bg-slate-100 shrink-0" />
                                <div className="flex-1 min-w-0 pr-1">
                                    <h3 className="font-semibold text-slate-800 text-[14px] sm:text-[15px] truncate">{user.full_name}</h3>
                                    <p className="text-[12px] sm:text-[13px] text-slate-500 mb-0.5 truncate">@{user.username}</p>
                                    <p className="text-[12px] sm:text-[13px] text-slate-600 truncate">{user.bio}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 sm:gap-3">
                                <button 
                                    onClick={() => navigate(`/profile/${user._id}`)}
                                    className="flex-1 bg-[#a111ff] hover:bg-[#920ee8] text-white py-2.5 sm:py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center"
                                >
                                    View Profile
                                </button>
                                
                                {currentTab === 'Following' && (
                                    <button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center">
                                        Unfollow
                                    </button>
                                )}
                                {currentTab === 'Pending' && (
                                    <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center">
                                        Accept
                                    </button>
                                )}
                                {currentTab === 'Connections' && (
                                    <button 
                                        onClick={() => navigate(`/messages/${user._id}`)}
                                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-[13px] sm:text-sm font-medium transition-colors cursor-pointer text-center"
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