import React, { Suspense } from 'react';
import Sidebar from '../components/Sidebar';
import Bottombar from '../components/Bottombar';
import { Outlet } from 'react-router-dom';
import Loading from '../components/Loading';
import { useSelector } from 'react-redux';

const Layout = () => {
    const user = useSelector((state) => state.user.value);
    return user ? (
        <div className='w-full flex h-screen relative bg-gray-200 dark:bg-slate-950'>
            <Sidebar />
            <div className='flex-1 bg-gray-200 dark:bg-slate-950 min-w-0 h-full flex flex-col pb-20 sm:pb-0 sm:ml-[270px]'>
                <Suspense fallback={<Loading />}>
                    <Outlet />
                </Suspense>
            </div>
            <Bottombar />
        </div>
    ) : (
        <Loading />
    )
};

export default Layout;
