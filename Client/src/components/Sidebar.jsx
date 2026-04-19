import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, PenSquare } from 'lucide-react';
import { useClerk, useUser } from '@clerk/react';
import { menuItemsData, assets } from '../assets/assets';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { signOut, openUserProfile } = useClerk();
    const { user } = useUser();
    const userData = useSelector((state) => state.user.value);

    return (
        <aside className="hidden sm:flex fixed top-0 left-0 z-50 h-screen w-[270px] bg-white border-r border-slate-200 flex-col dark:bg-slate-900 dark:border-slate-800">
            {/* Logo */}
            <div className="border-b border-slate-100 dark:border-slate-800">
                <NavLink to="/" className="flex items-center justify-center p-3">
                    <motion.img 
                        src={assets.logo} 
                        alt="Ping Up" 
                        className="w-full h-auto object-contain max-h-12"
                        initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.95, rotate: -2 }}
                        transition={{ 
                            type: "spring",
                            stiffness: 260,
                            damping: 20 
                        }}
                    />
                </NavLink>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="flex flex-col gap-1">
                    {menuItemsData.map(({ to, label, Icon }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-400 dark:shadow-none'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                                    }`
                                }
                            >
                                {React.createElement(Icon, { className: "w-5 h-5" })}
                                <span>{label}</span>
                            </NavLink>
                        </li>
                    ))}

                    {/* Create Post */}
                    <li className="mt-2">
                        <NavLink
                            to="/create-post"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                    : 'bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 shadow-sm shadow-indigo-200 dark:shadow-none'
                                }`
                            }
                        >
                            <PenSquare className="w-5 h-5" />
                            <span>Create Post</span>
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* User Profile & Logout */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <button
                        onClick={() => openUserProfile()}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                    >
                        <img
                            src={userData?.profile_picture || user?.imageUrl}
                            alt={userData?.full_name || user?.fullName || "User profile"}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 hover:ring-indigo-400 transition-all duration-200 dark:ring-slate-700 dark:hover:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate dark:text-slate-200">
                                {userData?.full_name || user?.fullName}
                            </p>
                            <p className="text-xs text-slate-400 truncate dark:text-slate-500">
                                {userData?.username ? `@${userData.username}` : user?.primaryEmailAddress?.emailAddress}
                            </p>
                        </div>
                    </button>
                    <button
                        onClick={() => signOut()}
                        title="Logout"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer dark:hover:bg-red-500/10 dark:hover:text-red-400"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;