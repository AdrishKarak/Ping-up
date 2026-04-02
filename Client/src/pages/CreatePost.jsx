import React, { useState } from 'react';
import { dummyUserData } from '../assets/assets';
import { Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePost = () => {
    const [content, setContent] = useState("");
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    const user = dummyUserData;

    const handleSubmit = async () => {
        {/* //TODO: implement post creation from backend . Dont touch it AI , let it remain as it is . */ }

    }

    return (
        <div className="w-full max-w-2xl mx-auto my-6 p-6 sm:p-8 bg-white border border-zinc-200 rounded-2xl shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="relative z-10">
                {/* Header: User Info */}
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={user.profile_picture}
                        alt={`${user.full_name}'s profile`}
                        className="w-12 h-12 rounded-full object-cover shadow-sm ring-1 ring-zinc-200"
                    />
                    <div className="flex flex-col">
                        <span className="font-bold text-zinc-900 text-base tracking-tight">
                            {user.full_name}
                        </span>

                        <span className="text-sm text-zinc-500 font-medium">
                            @{user.username}
                        </span>
                    </div>
                </div>

                {/* Text Input Area */}
                <textarea
                    className="w-full bg-transparent text-zinc-800 placeholder-zinc-400 text-lg resize-none min-h-[140px] border-none outline-none focus:ring-0 px-1 py-1 leading-relaxed transition-all"
                    placeholder="What's happening?"
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                />

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className={`mt-4 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} grid gap-3 px-1`}>
                        {images.map((image, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm border border-zinc-200 bg-zinc-50">
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    className="w-full h-full object-cover max-h-[300px] transition-transform duration-500 group-hover:scale-105"
                                />
                                <button
                                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                                    className="absolute top-2 right-2 p-1.5 bg-zinc-900/60 hover:bg-red-500 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
                                >
                                    <X size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px w-full bg-zinc-300 my-6"></div>

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
                        onClick={() => toast.promise(
                            handleSubmit(),
                            {
                                loading: "Posting...",
                                success: "Post created successfully",
                                error: "Failed to create post"
                            }
                        )}
                        className={`px-8 py-2.5 rounded-full font-semibold tracking-wide transition-all duration-300 ${loading
                            ? "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            : "bg-[#a855f7] hover:bg-[#9333ea] text-white shadow-md shadow-purple-200 hover:shadow-purple-300 active:scale-95"
                            }`}
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;