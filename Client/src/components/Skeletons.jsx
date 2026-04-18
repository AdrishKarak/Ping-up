import React from 'react';

export const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
);

export const PostSkeleton = () => (
    <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/80 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
            </div>
        </div>
        <Skeleton className="mt-4 h-20 w-full rounded-xl" />
        <div className="mt-4 flex gap-6">
            <Skeleton className="h-8 w-12 rounded-full" />
            <Skeleton className="h-8 w-12 rounded-full" />
            <Skeleton className="h-8 w-12 rounded-full" />
        </div>
    </div>
);

export const StorySkeleton = () => (
    <div className="rounded-lg min-w-30 max-w-30 max-h-40 aspect-3/4 border border-gray-100 dark:border-slate-800 shrink-0 overflow-hidden relative">
        <Skeleton className="w-full h-full rounded-lg" />
        <div className="absolute top-2 left-2">
            <Skeleton className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900" />
        </div>
        <div className="absolute bottom-2 left-2 right-2">
            <Skeleton className="h-3 w-3/4 rounded-full" />
        </div>
    </div>
);

export const UserCardSkeleton = () => (
    <div className="p-4 pt-6 flex flex-col justify-between w-72 shadow bg-white border border-gray-200 rounded-lg dark:bg-slate-900 dark:border-slate-800">
        <div className="flex flex-col items-center">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="mt-4 h-4 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/3" />
            <Skeleton className="mt-4 h-12 w-full px-4 rounded-md" />
        </div>
        <div className="mt-6 flex gap-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
        </div>
    </div>
);
