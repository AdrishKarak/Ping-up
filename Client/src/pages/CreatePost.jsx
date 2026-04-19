import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

const CreatePost = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const user = useSelector((state) => state.user.value);
    const { getToken } = useAuth();

    const handleSubmit = async () => {
        if (!images.length && !content.trim()) {
            return toast.error("Please add an image or content");
        }

        setLoading(true);
        const loadingToast = toast.loading("Posting...");
        const postType = images.length && content.trim() ? 'text_with_image' : images.length ? 'image' : 'text';

        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append("content", content.trim());
            formData.append("post_type", postType);
            images.forEach((image) => {
                formData.append("images", image);
            });

            const { data } = await api.post('/api/post/add', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (data.success) {
                // Invalidate feed query to force refresh
                queryClient.invalidateQueries({ queryKey: ['feed'] });

                toast.success(data.message || "Post created successfully", { id: loadingToast });
                setContent("");
                setImages([]);
                navigate("/");
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Failed to create post", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    }

    if (!user) return null;

    return (
        <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
            <div className="relative z-10">
                {/* Header: User Info */}
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={user.profile_picture}
                        alt={`${user.full_name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-zinc-200 dark:ring-slate-700"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 text-base tracking-tight dark:text-slate-100">
                            {user.full_name}
                        </span>

                        <span className="text-sm text-zinc-500 font-medium dark:text-slate-400">
                            @{user.username}
                        </span>
                    </div>
                </div>

                {/* Text Input Area */}
                <textarea
                    className="w-full bg-transparent text-zinc-800 placeholder-zinc-400 text-lg resize-none min-h-[140px] border-none outline-none focus:ring-0 px-1 py-1 leading-relaxed transition-all dark:text-slate-100 dark:placeholder-slate-500"
                    placeholder="What's happening?"
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                />

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className={`mt-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} grid gap-3 px-1`}>
                        {images.map((image, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm border border-zinc-200 bg-zinc-50 dark:border-slate-700 dark:bg-slate-800">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    className="w-full h-full object-cover max-h-[300px] transition-transform duration-500 group-hover:scale-105"
                                />
                                <button
                                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                                    className="absolute top-2 right-2 p-1.5 bg-zinc-900/60 hover:bg-red-500 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 dark:bg-black/60"
                                >
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px w-full bg-zinc-300 my-6 dark:bg-slate-800"></div>

                {/* Action Bar */}
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <label htmlFor="images" className="p-2.5 rounded-full text-[#a855f7] hover:bg-purple-50 transition-colors cursor-pointer group flex items-center justify-center relative">
                            <ImageIcon size={24} className="group-hover:scale-110 transition-transform" />
                            <span className="absolute -top-10 bg-zinc-800 text-xs text-white px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Add Image
                            </span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            id="images"
                            onChange={(e) => {
                                if (e.target.files) {
                                    setImages([...images, ...Array.from(e.target.files)]);
                                }
                            }}
                            hidden
                            multiple
                        />
                    </div>

                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className={`px-8 py-2.5 rounded-full font-semibold tracking-wide transition-all duration-300 ${loading
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            : "bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-md shadow-purple-200 hover:shadow-purple-300 active:scale-95"
                            }`}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
