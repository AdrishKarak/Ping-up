import { NavLink } from 'react-router-dom';
import { useClerk, useUser } from '@clerk/react';
import { useSelector } from 'react-redux';
import { menuItemsData } from '../assets/assets';

// 6 colors for up to 6 menu items (3 left + 3 right of the center button)
const COLOR_MAP = [
    { bg: 'bg-blue-200 dark:bg-blue-500/20', icon: 'text-blue-800 dark:text-blue-400' },
    { bg: 'bg-purple-200 dark:bg-purple-500/20', icon: 'text-purple-800 dark:text-purple-400' },
    { bg: 'bg-amber-200 dark:bg-amber-500/20', icon: 'text-amber-900 dark:text-amber-400' },
    { bg: 'bg-teal-200 dark:bg-teal-500/20', icon: 'text-teal-800 dark:text-teal-400' },
    { bg: 'bg-pink-200 dark:bg-pink-500/20', icon: 'text-pink-900 dark:text-pink-400' },
    { bg: 'bg-green-200 dark:bg-green-500/20', icon: 'text-green-800 dark:text-green-400' },
];

const DOT_MAP = [
    'bg-blue-700 dark:bg-blue-400',
    'bg-purple-700 dark:bg-purple-400',
    'bg-amber-800 dark:bg-amber-400',
    'bg-teal-700 dark:bg-teal-400',
    'bg-pink-800 dark:bg-pink-400',
    'bg-green-700 dark:bg-green-400',
];

const BottomBar = () => {
    const { openUserProfile } = useClerk();
    const { user } = useUser();
    const userData = useSelector((state) => state.user.value);

    // Split menu items: 3 left, rest right of the center Create Post button
    const leftItems = menuItemsData.slice(0, 3);   // indices 0-2
    const rightItems = menuItemsData.slice(3);        // indices 3-5

    const NavItem = ({ to, Icon, colorIndex, isEnd }) => {
        const color = COLOR_MAP[colorIndex % COLOR_MAP.length];
        const dot = DOT_MAP[colorIndex % DOT_MAP.length];
        return (
            <NavLink
                to={to}
                end={isEnd}
                className="flex flex-col items-center flex-1 max-w-[52px] py-1"
            >
                {({ isActive }) => (
                    <>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                            ${isActive ? color.bg : 'bg-transparent'}`}>
                            <Icon className={`w-[19px] h-[19px] transition-all duration-200
                                ${isActive ? `${color.icon} stroke-[2.3px]` : 'text-slate-500 dark:text-slate-400 stroke-[1.8px]'}`}
                            />
                        </div>
                        <div className={`w-1 h-1 rounded-full mt-1 transition-all duration-200
                            ${isActive ? dot : 'bg-transparent'}`}
                        />
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md ring ring-purple-500 ring-offset-2 shadow-md shadow-purple-300 rounded-xl dark:bg-slate-900/95 dark:ring-purple-600 dark:ring-offset-slate-950 dark:shadow-purple-900/40">
            <div className="flex items-center justify-around px-2 pt-2 pb-[calc(env(safe-area-inset-bottom)+8px)]">

                {/* Left 3 items */}
                {leftItems.map(({ to, Icon }, i) => (
                    <NavItem key={to} to={to} Icon={Icon} colorIndex={i} isEnd={to === '/'} />
                ))}

                {/* Center — Create Post */}
                <NavLink
                    to="/create-post"
                    className="flex flex-col items-center flex-1 max-w-[52px] py-1"
                >
                    {({ isActive }) => (
                        <>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200
                                ${isActive
                                    ? 'bg-indigo-700 shadow-lg shadow-indigo-400/40'
                                    : 'bg-linear-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-400/35'
                                }`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="21" height="21"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                            </div>
                            <div className={`w-1 h-1 rounded-full mt-1 transition-all duration-200
                                ${isActive ? 'bg-indigo-600' : 'bg-transparent'}`}
                            />
                        </>
                    )}
                </NavLink>

                {/* Right items */}
                {rightItems.map(({ to, Icon }, i) => (
                    <NavItem key={to} to={to} Icon={Icon} colorIndex={i + 3} isEnd={false} />
                ))}

                {/* Profile avatar — rightmost */}
                <button
                    onClick={() => openUserProfile()}
                    className="flex flex-col items-center flex-1 max-w-[52px] py-1 active:scale-95 transition-transform"
                >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center">
                        <img
                            src={userData?.profile_picture || user?.imageUrl}
                            alt="Profile"
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-green-400"
                        />
                    </div>
                    <div className="w-1 h-1 rounded-full mt-1 bg-transparent" />
                </button>

            </div>
        </nav>
    );
};

export default BottomBar;