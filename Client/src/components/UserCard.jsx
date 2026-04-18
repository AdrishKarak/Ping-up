import { useNavigate } from "react-router-dom";
import { LocateFixed, MessageCircle, UserPlus } from "lucide-react"
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "@clerk/react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { fetchUser } from "../features/user/userSlice";
import { useState } from "react";


const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.value);
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [requestSent, setRequestSent] = useState(false);
    const isFollowing = currentUser?.following?.includes(user._id);
    const isConnected = currentUser?.connections?.includes(user._id);

    const handleFollow = async () => {
        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/follow', { id: user._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                dispatch(fetchUser(token));
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to follow user");
        }
    }

    const handleConnectionRequest = async () => {
        if (isConnected || isFollowing) {
            navigate(`/messages/${user._id}`);
            return;
        }

        if (requestSent) {
            return;
        }

        try {
            const token = await getToken();
            const { data } = await api.post('/api/user/connect', { id: user._id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message);
                setRequestSent(true);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to send connection request");
        }
    }

    return (
        <div key={user._id} className="p-4 pt-6 flex flex-col justify-between w-72 shadow bg-white border border-gray-200 rounded-lg dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
            <div className="text-center">
                <img src={user.profile_picture} alt="" className="rounded-full w-16 shadow-md mx-auto dark:border-slate-700 dark:border dark:shadow-none" />
                <h3 className="font-semibold text-gray-800 mt-2 dark:text-slate-100">{user.full_name}</h3>
                {user.username && <p className="text-gray-400 text-sm font-light dark:text-slate-500">@{user.username}</p>}
                {user.bio && <p className="text-gray-600 text-sm px-4 mt-2 text-center dark:text-slate-400">{user.bio}</p>}
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 dark:border-slate-700">
                    <LocateFixed className='w-4 h-4' /> {user.location}
                </div>
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1 dark:border-slate-700">
                    <span className="">{user.followers?.length || 0}</span> Followers
                </div>
            </div>

            <div className="flex mt-4 gap-2 ">
                {/*Follow button*/}
                <button
                    onClick={handleFollow}
                    disabled={isFollowing}
                    className="w-full py-2 rounded-lg flex justify-center items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 cursor-pointer text-white"
                >
                    <UserPlus className="w-4 h-4" />
                    {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                    onClick={handleConnectionRequest}
                    disabled={requestSent}
                    className={`w-full py-2 rounded-lg flex justify-center items-center gap-2 border active:scale-95 transition-all duration-200 cursor-pointer ${
                        requestSent
                            ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-600"
                            : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                >
                    <MessageCircle className="w-4 h-4" />
                    {isConnected || isFollowing ? "Message" : requestSent ? "Requested" : "Connect"}
                </button>
            </div>
        </div>
    )
}

export default UserCard;
