import { useNavigate } from "react-router-dom";
import { dummyUserData } from "../assets/assets"
import { LocateFixed, MessageCircle, Plus, UserPlus } from "lucide-react"


const UserCard = ({ user }) => {
    const currentUser = dummyUserData
    const navigate = useNavigate();

    const handleFollow = async () => {
        //For later when backend is ready
    }

    const handleConnectionRequest = async () => {
        //For later when backend is ready
    }

    return (
        <div key={user._id} className="p-4 pt-6 flex flex-col justify-between w-72 shadow bg-white border border-gray-200 rounded-lg">
            <div className="text-center">
                <img src={user.profile_picture} alt="" className="rounded-full w-16 shadow-md mx-auto" />
                <h3 className="font-semibold text-gray-800 mt-2">{user.full_name}</h3>
                {user.username && <p className="text-gray-400 text-sm font-light">@{user.username}</p>}
                {user.bio && <p className="text-gray-600 text-sm px-4 mt-2 text-center">{user.bio}</p>}
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <LocateFixed className='w-4 h-4' /> {user.location}
                </div>
                <div className="flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1">
                    <span className="">{user.followers?.length || 0}</span> Followers
                </div>
            </div>

            <div className="flex mt-4 gap-2 ">
                {/*Follow button*/}
                <button
                    onClick={handleFollow}
                    disabled={currentUser?.following?.includes(user._id)}
                    className="w-full py-2 rounded-lg flex justify-center items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition-all duration-200 cursor-pointer text-white"
                >
                    <UserPlus className="w-4 h-4" />
                    {currentUser?.following?.includes(user._id) ? "Following" : "Follow"}
                </button>

                {/*Connection request button*/}
                <button onClick={handleConnectionRequest} className="flex items-center justify-center w-16 border border-slate-300 text-slate-600 group rounded-lg cursor-pointer active:scale-95 transition-all duration-200">
                    {currentUser?.connection_requests?.includes(user._id) || currentUser?.following?.includes(user._id)
                        ? <MessageCircle onClick={() => navigate(`/messages/${user._id}`)} className="w-5 h-5 group-hover:scale-105 transition-all duration-200 cursor-pointer" />
                        : <Plus className="w-5 h-5 group-hover:scale-105 transition-all duration-200 cursor-pointer" />
                    }
                </button>
            </div>
        </div>
    )
}

export default UserCard;