import React from 'react';
import { assets } from '../assets/assets';
import { Star } from 'lucide-react';
import { SignIn } from '@clerk/react';

const Login = () => {
    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <img src={assets.bgImage} alt='bgImage' className='absolute top-0 left-0 -z-1 w-full h-full object-cover' />

            <div className='flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:p-40'>
                <img src={assets.logo} alt='logo' className='h-12 object-contain' />
                <div>
                    <div className='flex items-center gap-3 mb-4 max-md:mt-10'>
                        <img src={assets.group_users} alt='group users' className='h-8 md:h-10' />
                        <div>
                            <div className='flex'>
                                {Array(5).fill(0).map((_, i) => (<Star key={i} className='text-transparent fill-amber-500 size-4 md:size-5' />))}
                            </div>
                            <p>Rated 5 stars by 1000+ users</p>
                        </div>
                    </div>
                    <h1 className='text-3xl md:text-6xl font-bold md:pb-2 bg-linear-to-r from-indigo-950 to-indigo-800 bg-clip-text text-transparent'>More than just friends</h1>
                    <p className='text-xl md:text-2xl text-indigo-600 max-w-72 md:max-w-md'>Connect with people who share your interests and passions.</p>
                </div>
                <span className='md:h-10'></span>
            </div>
            <div className='flex-1 flex items-center justify-center p-6 sm:p-10'>
                <SignIn />
            </div>
        </div>
    );
};

export default Login;