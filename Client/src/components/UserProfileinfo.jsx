

const UserProfileinfo = ({ user, posts, profileId, setShowEdit }) => {
    return (
        <div>
            <div className="relative py-4 px-6 md:px-8 bg-white">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full">
                        <img src={user.profile_picture} alt="" className="absolute rounded-full" />
                    </div>
                    <div className="w-full pt-16 md:pt-0 md:pl-36">
                        <div className="flex flex-col md:flex-row items-start justify-between">
                            <div className="flex items-center gap-3">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfileinfo;