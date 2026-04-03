import { useRef, useState } from "react";
import { dummyUserData } from "../assets/assets";
import { Camera, MapPin, User, AtSign, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

const ProfileModal = ({ setShowEditProfile }) => {
    const user = dummyUserData;
    const fileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [editForm, setEditForm] = useState({
        full_name: user.full_name,
        username: user.username,
        bio: user.bio,
        location: user.location,
        profile_picture: null,
        cover_photo: null,
    });

    const [previewUrl, setPreviewUrl] = useState(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState(null);

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm({ ...editForm, profile_picture: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditForm({ ...editForm, cover_photo: file });
            setCoverPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        // Simulate a tiny delay for realism before toast
        const loadingToast = toast.loading("Updating profile...");

        setTimeout(() => {
            toast.success("Profile updated successfully!", { id: loadingToast });
            setShowEditProfile(false);
        }, 800);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 animate-in"
            onClick={() => setShowEditProfile(false)}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-modal-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header Cover Photo ── */}
                <div className="h-32 bg-linear-to-br from-purple-500 via-purple-400 to-indigo-400 relative group/cover cursor-pointer overflow-hidden">
                    {/* Cover Image Preview */}
                    {(coverPreviewUrl || user.cover_photo) && (
                        <img
                            src={coverPreviewUrl || user.cover_photo}
                            alt="Cover preview"
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover/cover:scale-105 transition-transform duration-700"
                        />
                    )}

                    {/* Gradient Overlay for text readability */}
                    <div className="absolute inset-0 bg-black/20 group-hover/cover:bg-black/40 transition-colors duration-300" />

                    {/* Change Cover Button (centered) */}
                    <button
                        type="button"
                        onClick={() => coverInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center text-white opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 gap-1.5"
                    >
                        <Camera className="w-6 h-6 drop-shadow-lg" />
                        <span className="text-[10px] font-bold uppercase tracking-wider drop-shadow-lg">Change Cover</span>
                    </button>

                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                    />

                    {/* Decorative circles (only visible if no cover image) */}
                    {!(coverPreviewUrl || user.cover_photo) && (
                        <>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10" />
                        </>
                    )}

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={() => setShowEditProfile(false)}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md transition-colors cursor-pointer z-20"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    {/* Title */}
                    <div className="absolute top-5 left-6 z-10">
                        <h2 className="text-white font-bold text-lg tracking-tight drop-shadow-md">Edit Profile</h2>
                        <p className="text-white/80 text-xs drop-shadow-md">Update your personal information</p>
                    </div>
                </div>

                {/* ── Avatar Picker ── */}
                <div className="flex justify-center -mt-10 relative z-10">
                    <div className="relative group">
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                            <img
                                src={previewUrl || user.profile_picture}
                                alt={user.full_name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Camera overlay */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300 cursor-pointer"
                        >
                            <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" />
                        </button>
                        {/* Green dot badge */}
                        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center">
                            <Camera className="w-2.5 h-2.5 text-white" />
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSaveProfile} className="px-6 pt-5 pb-6 space-y-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="full_name" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <User className="w-3.5 h-3.5" />
                            Full Name
                        </label>
                        <input
                            id="full_name"
                            name="full_name"
                            type="text"
                            value={editForm.full_name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
                        />
                    </div>

                    {/* Username */}
                    <div className="space-y-1.5">
                        <label htmlFor="username" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <AtSign className="w-3.5 h-3.5" />
                            Username
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">@</span>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={editForm.username}
                                onChange={handleChange}
                                placeholder="username"
                                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
                            />
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1.5">
                        <label htmlFor="bio" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <FileText className="w-3.5 h-3.5" />
                            Bio
                        </label>
                        <textarea
                            id="bio"
                            name="bio"
                            value={editForm.bio}
                            onChange={handleChange}
                            placeholder="Tell others about yourself..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all resize-none"
                        />
                        <p className="text-[11px] text-gray-400 text-right">{editForm.bio.length}/160</p>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <label htmlFor="location" className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <MapPin className="w-3.5 h-3.5" />
                            Location
                        </label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            value={editForm.location}
                            onChange={handleChange}
                            placeholder="City, Country"
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
                        />
                    </div>

                    {/* ── Action Buttons ── */}
                    <div className="flex items-center gap-3 pt-3">
                        <button
                            type="button"
                            onClick={() => setShowEditProfile(false)}
                            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-linear-to-r from-purple-500 to-purple-600 text-sm font-semibold text-white shadow-[0_2px_10px_rgba(147,51,234,0.3)] hover:shadow-[0_4px_16px_rgba(147,51,234,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>

            {/* Scoped keyframe animation */}
            <style>{`
                .animate-modal-in {
                    animation: modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes modalSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px) scale(0.97);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-in {
                    animation: fadeIn 0.2s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ProfileModal;