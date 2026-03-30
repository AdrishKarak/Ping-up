import React, { useState, useEffect } from 'react';
import { dummyConnectionsData } from '../assets/assets';
import UserCard from '../components/UserCard';
import Loading from '../components/Loading';
import { Search } from 'lucide-react';

const Discover = () => {
    const [input, setInput] = useState("");
    const [users, setUsers] = useState(dummyConnectionsData)
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const trimmedInput = input.trim();

        // Optimization: Do NOT trigger a search/API call for just a single character
        if (trimmedInput.length === 1) {
            setUsers(dummyConnectionsData);
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            if (!trimmedInput) {
                setUsers(dummyConnectionsData);
            } else {
                const searchTerm = trimmedInput.toLowerCase();
                const filtered = dummyConnectionsData.filter((user) => {
                    return (
                        user.full_name?.toLowerCase().includes(searchTerm) ||
                        user.username?.toLowerCase().includes(searchTerm) ||
                        user.bio?.toLowerCase().includes(searchTerm) ||
                        user.location?.toLowerCase().includes(searchTerm)
                    );
                });
                setUsers(filtered);
            }
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [input]);

    return (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-full max-w-[950px] flex flex-col">
                <div className="mb-6 md:mb-8 pl-1">
                    <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 mb-1.5 tracking-tight">Discover People</h1>
                    <p className="text-slate-500 text-[13px] md:text-sm">Connect with amazing people and grow your network</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-xl text-[14px] sm:text-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 text-slate-800"
                        placeholder="Search people by name, username, bio, or location..."
                    />
                </div>

                {loading ? (
                    <Loading height='60vh' />
                ) : (
                    <div className="flex flex-wrap gap-5 sm:gap-6 justify-center sm:justify-start pb-10">
                        {users.map((user) => (
                            <UserCard key={user._id} user={user} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;