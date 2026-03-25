import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, PenSquare } from 'lucide-react';
import { useClerk, useUser } from '@clerk/react';
import { menuItemsData, assets } from '../assets/assets';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const { signOut, openUserProfile } = useClerk();
    const { user } = useUser();

    return (
        <>
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed sm:static top-0 left-0 z-50
                    h-screen w-[270px]
                    bg-white border-r border-slate-200
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    sm:translate-x-0
                `}
            >
                {/* Logo */}
                <div className="border-b border-slate-100">
                    <NavLink to="/" onClick={() => setSidebarOpen(false)} className="flex items-center justify-center p-3">
                        <img src={assets.logo} alt="Ping Up" className="w-full h-auto object-contain max-h-12" />
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
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`
                                    }
                                >
                                    <Icon className="w-5 h-5" />
                                    <span>{label}</span>
                                </NavLink>
                            </li>
                        ))}

                        {/* Create Post */}
                        <li className="mt-2">
                            <NavLink
                                to="/create-post"
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200'
                                        : 'bg-linear-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600 shadow-sm shadow-indigo-200'
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
                <div className="p-3 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                        <button
                            onClick={() => openUserProfile()}
                            className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                        >
                            <img
                                src={user?.imageUrl}
                                alt={user?.fullName}
                                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100 hover:ring-indigo-400 transition-all duration-200"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                    {user?.primaryEmailAddress?.emailAddress}
                                </p>
                            </div>
                        </button>
                        <button
                            onClick={() => signOut()}
                            title="Logout"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;