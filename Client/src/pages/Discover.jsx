import React, { useState, useEffect, useRef } from 'react';
import UserCard from '../components/UserCard';
import { Search } from 'lucide-react';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { UserCardSkeleton } from '../components/Skeletons';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';

const Discover = () => {
    const [input, setInput] = useState("");
    const [debouncedInput, setDebouncedInput] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const { getToken } = useAuth();
    const searchCache = useRef({});

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedInput(input);
        }, 500);
        return () => clearTimeout(timer);
    }, [input]);

    useEffect(() => {
        const trimmedInput = debouncedInput.trim();
        const searchInput = trimmedInput.length < 3 ? "" : trimmedInput;

        const loadInitialUsers = async () => {
            if (searchCache.current[searchInput]) {
                const cached = searchCache.current[searchInput];
                setUsers(cached.users);
                setHasMore(cached.hasMore);
                setPage(1);
                return;
            }

            setLoading(true);
            try {
                const token = await getToken();
                const { data } = await api.post('/api/user/discover', { 
                    input: searchInput,
                    page: 1,
                    limit: 9
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (data.success) {
                    setUsers(data.users || []);
                    setHasMore(data.hasMore || false);
                    setPage(1);
                    searchCache.current[searchInput] = {
                        users: data.users || [],
                        hasMore: data.hasMore || false
                    };
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error(error.response?.data?.message || error.message || "Failed to search users");
            } finally {
                setLoading(false);
            }
        };

        loadInitialUsers();
    }, [debouncedInput, getToken]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;

        const trimmedInput = debouncedInput.trim();
        const searchInput = trimmedInput.length < 3 ? "" : trimmedInput;

        setLoadingMore(true);
        const nextPage = page + 1;
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/discover', { 
                input: searchInput,
                page: nextPage,
                limit: 9
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setUsers((prev) => [...prev, ...(data.users || [])]);
                setHasMore(data.hasMore || false);
                setPage(nextPage);
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to load more users");
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto no-scrollbar w-full flex justify-center py-6 sm:py-10 px-4 sm:px-8">
            <SEO title="Discover" description="Discover new people and grow your network on PingUp." />
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

                <div className="flex flex-wrap gap-5 sm:gap-6 justify-center sm:justify-start pb-6">
                    {loading ? (
                        <>
                            <UserCardSkeleton />
                            <UserCardSkeleton />
                            <UserCardSkeleton />
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

                {users.length === 0 && !loading && (
                    <Motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 px-4 text-center"
                    >
                        <div className="w-20 h-20 bg-purple-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-purple-500 mb-5 shadow-inner">
                            <Search className="w-9 h-9" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No people found</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                            We couldn't find any profiles matching "{input}". Try searching for another name, username, or location.
                        </p>
                    </Motion.div>
                )}

                {hasMore && (
                    <div className="flex justify-center mt-6 pb-12">
                        <button
                            onClick={handleLoadMore}
                            disabled={loadingMore}
                            className="relative group px-8 py-3.5 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-purple-400 disabled:to-indigo-400 text-white font-semibold rounded-2xl shadow-[0_4px_15px_rgba(124,58,237,0.25)] hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)] transition-all duration-300 active:scale-98 disabled:scale-100 disabled:pointer-events-none cursor-pointer flex items-center justify-center gap-2.5 min-w-[160px]"
                        >
                            {loadingMore ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Loading...</span>
                                </>
                            ) : (
                                <>
                                    <span>Load More Profiles</span>
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-md font-medium group-hover:bg-white/30 transition-colors">
                                        +9
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Discover;
