import React, { useState, useEffect } from 'react';
import UserCard from '../components/UserCard';
import { Search } from 'lucide-react';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserCardSkeleton } from '../components/Skeletons';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Discover = () => {
    const [input, setInput] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { getToken } = useAuth();

    useEffect(() => {
        const trimmedInput = input.trim();

        if (trimmedInput.length === 1) {
            setUsers([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const token = await getToken();
                const { data } = await api.post('/api/user/discover', { input: trimmedInput }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setUsers(data.users || []);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to search users");
            } finally {
                setLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [input, getToken]);

    return (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <div className="w-full max-w-[950px] flex flex-col">
                <div className="mb-6 md:mb-8 pl-1">
                    <h1 className="text-2xl md:text-[28px] font-bold text-slate-900 mb-1.5 tracking-tight dark:text-slate-100">Discover People</h1>
                    <p className="text-slate-500 text-[13px] md:text-sm dark:text-slate-400">Connect with amazing people and grow your network</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                    </div>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-white border border-gray-200 rounded-xl text-[14px] sm:text-[15px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-400 text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:shadow-none"
                        placeholder="Search people by name, username, bio, or location..."
                    />
                </div>

                <div className="flex flex-wrap gap-5 sm:gap-6 justify-center sm:justify-start pb-10">
                    {loading ? (
                        <>
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                        </>
                    ) : (
                        <AnimatePresence>
                            {users.map((user) => (
                                <Motion.div
                                    key={user._id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <UserCard user={user} />
                                </Motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Discover;
