import React from 'react';

const Loading = () => {
    return (
        <div className="flex items-center justify-center h-screen w-full bg-slate-100 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-6">
                {/* Animated rings */}
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-indigo-200 animate-ping opacity-20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
                    <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
                </div>

                {/* Animated dots */}
                <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-500 tracking-wide dark:text-slate-400">Loading</span>
                    <span className="flex gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1 h-1 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1 h-1 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Loading;
