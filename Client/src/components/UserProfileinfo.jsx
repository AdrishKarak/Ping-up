
import { BadgeCheck, Calendar, MapPin, SquarePen } from 'lucide-react';

const getRelativeTime = (dateString) => {
    const createdAt = new Date(dateString);
    const diffMs = Date.now() - createdAt.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffDays < 1) return 'today';
    if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    if (diffMonths < 12) return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
};

const UserProfileinfo = ({ user, profileId, posts, setShowEditProfile }) => {
    return (
        <div className="relative px-5 pb-5 md:px-8 md:pb-6">
            <div className="flex flex-col gap-4 md:gap-5">
                {/* Avatar + Name + Edit row */}
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col items-center text-center md:flex-row md:items-end md:text-left">
                        {/* Profile picture */}
                        <div className="h-28 w-28 -mt-14 overflow-hidden rounded-full border-[3.5px] border-white bg-white shadow-lg ring-2 ring-purple-100 sm:h-32 sm:w-32 sm:-mt-16 md:-mt-20">
                            <img
                                src={user.profile_picture}
                                alt={user.full_name}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {/* Name & username */}
                        <div className="mt-3 md:ml-5 md:mt-0">
                            <div className="flex items-center justify-center gap-1.5 md:justify-start">
                                <h1 className="text-xl mt-4 font-bold tracking-tight text-gray-900 sm:text-2xl">
                                    {user.full_name}
                                </h1>
                                {user.is_verified && (
                                    <BadgeCheck
                                        className="h-5 w-5 shrink-0 mt-4 text-blue-500 sm:h-[22px] sm:w-[22px]"
                                        fill="currentColor"
                                        stroke="white"
                                        strokeWidth={1.5}
                                    />
                                )}
                            </div>
                            <p className="mt-0.5 text-sm font-medium text-gray-400">
                                {user.username ? `@${user.username}` : "Add username"}
                            </p>
                        </div>
                    </div>

                    {/* Edit button — only on own profile */}
                    {!profileId && (
                        <div className="flex justify-center md:justify-end">
                            <button
                                onClick={() => setShowEditProfile(true)}
                                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:border-purple-300 hover:text-purple-600 hover:shadow cursor-pointer"
                            >
                                <SquarePen className="h-4 w-4" />
                                Edit
                            </button>
                        </div>
                    )}
                </div>

                {/* Bio */}
                {user.bio && (
                    <p className="text-[14px] sm:text-[15px] leading-relaxed text-gray-700 whitespace-pre-line max-w-xl mt-1">
                        {user.bio}
                    </p>
                )}

                {/* Location & Joined */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-gray-400">
                    {user.location && (
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {user.location}
                        </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Joined{' '}
                        <span className="font-medium text-gray-500">
                            {getRelativeTime(user.createdAt)}
                        </span>
                    </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-5 sm:gap-6 pt-1">
                    <StatItem value={posts?.length ?? 0} label="Posts" />
                    <StatItem value={user.followers?.length ?? 0} label="Followers" />
                    <StatItem value={user.following?.length ?? 0} label="Following" />
                </div>
            </div>
        </div>
    );
};

const StatItem = ({ value, label }) => (
    <div className="flex items-baseline gap-1.5">
        <span className="text-base font-bold text-gray-900">{value}</span>
        <span className="text-[13px] text-gray-400 font-medium">{label}</span>
    </div>
);

export default UserProfileinfo;
