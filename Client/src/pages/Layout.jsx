import React, { Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import Bottombar from '../components/Bottombar';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Loading from '../components/Loading';
import { useSelector } from 'react-redux';
import { assets } from '../assets/assets';

const Layout = () => {
    const user = useSelector((state) => state.user.value);
    const location = useLocation();
    const isChatBox = /^\/messages\/[^/]+\/?$/.test(location.pathname);

    return user ? (
        <div className='w-full flex h-screen relative bg-gray-200 dark:bg-slate-950'>
            <Sidebar />
            <div className='flex-1 bg-gray-200 dark:bg-slate-950 min-w-0 h-full flex flex-col pb-20 sm:pb-0 sm:ml-[270px]'>
                {!isChatBox && (
                    <header className="sm:hidden shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 dark:bg-slate-900/95 dark:border-slate-800">
                        <NavLink to="/" className="flex items-center px-4 h-14">
                            <img
                                src={assets.logo}
                                alt="Ping Up"
                                className="h-9 w-auto object-contain"
                            />
                        </NavLink>
                    </header>
                )}
                <div className="flex-1 min-h-0 flex flex-col h-full">
                    <Suspense fallback={<Loading />}>
                        <Outlet />
                    </Suspense>
                </div>
            </div>
            <Bottombar />
        </div>
    ) : (
        <Loading />
    )
};

export default Layout;
