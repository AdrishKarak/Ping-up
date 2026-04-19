import React, { useState } from 'react';
import { Image as ImageIcon, X, ArrowLeft } from 'lucide-react';
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

    // ── Original logic untouched ──
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
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
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
    };

    const canPost = !loading && (content.trim() || images.length > 0);
    const count = Math.min(images.length, 4);

    if (!user) return null;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                .cp-root {
                    font-family: 'DM Sans', sans-serif;
                    flex: 1; min-height: 0;
                    display: flex; flex-direction: column;
                    background: #f0eee9;
                    overflow: hidden;
                    padding: 16px;
                    box-sizing: border-box;
                }
                .dark .cp-root { background: #080c18; }

                .cp-topbar {
                    display: flex; align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px; flex-shrink: 0;
                }
                .cp-back {
                    width: 38px; height: 38px; border-radius: 12px;
                    border: 1.5px solid #d6d3cc; background: #fff;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #555; transition: all 0.15s;
                }
                .dark .cp-back { background: #0e1526; border-color: #1a2540; color: #8899bb; }
                .cp-back:hover { border-color: #7c5cfc; color: #7c5cfc; }

                .cp-page-title {
                    font-family: 'Sora', sans-serif;
                    font-size: 17px; font-weight: 700;
                    color: #0f0f12; letter-spacing: -0.4px;
                }
                .dark .cp-page-title { color: #f2f0ec; }

                .cp-post-btn {
                    padding: 9px 22px; border-radius: 50px; border: none;
                    font-family: 'Sora', sans-serif; font-size: 14px; font-weight: 700;
                    cursor: pointer; transition: all 0.18s;
                }
                .cp-post-btn.active {
                    background: #7c5cfc; color: #fff;
                    box-shadow: 0 4px 16px rgba(124,92,252,0.38);
                }
                .cp-post-btn.active:hover { background: #6b4ef0; transform: translateY(-1px); }
                .cp-post-btn.active:active { transform: scale(0.96); }
                .cp-post-btn.inactive { background: #dedad3; color: #b0aca5; cursor: not-allowed; }
                .dark .cp-post-btn.inactive { background: #1a2540; color: #3d5070; }

                .cp-card {
                    flex: 1; min-height: 0; display: flex; flex-direction: column;
                    border-radius: 22px; background: #ffffff;
                    border: 1.5px solid #e2dfd8; overflow: hidden;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.07);
                }
                .dark .cp-card {
                    background: #0e1526;
                    border-color: #1a2540;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
                }

                .cp-body { flex: 1; overflow-y: auto; padding: 20px 20px 12px; scrollbar-width: none; }
                .cp-body::-webkit-scrollbar { display: none; }

                .cp-user-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
                .cp-avatar {
                    width: 46px; height: 46px; border-radius: 14px;
                    object-fit: cover; flex-shrink: 0; border: 2px solid #ebe8e2;
                }
                .dark .cp-avatar { border-color: #1e2e4a; }
                .cp-user-name {
                    font-family: 'Sora', sans-serif; font-size: 15px;
                    font-weight: 700; color: #0f0f12; line-height: 1.2;
                }
                .dark .cp-user-name { color: #f2f0ec; }
                .cp-user-handle { font-size: 13px; color: #aaa; }

                .cp-divider { height: 1px; background: #eeebe5; margin: 0 0 16px; }
                .dark .cp-divider { background: #182035; }

                .cp-textarea {
                    width: 100%; background: transparent; border: none; outline: none;
                    resize: none; font-family: 'DM Sans', sans-serif;
                    font-size: 18px; font-weight: 400; color: #0f0f12;
                    line-height: 1.65; min-height: 110px; padding: 0; box-sizing: border-box;
                }
                .dark .cp-textarea { color: #dde4f5; }
                .cp-textarea::placeholder { color: #bfbbb4; }
                .dark .cp-textarea::placeholder { color: #2c3a55; }

                /* Image grid */
                .cp-img-grid { margin-top: 14px; display: grid; gap: 6px; border-radius: 16px; overflow: hidden; }
                .cp-img-grid.n1 { grid-template-columns: 1fr; }
                .cp-img-grid.n2 { grid-template-columns: 1fr 1fr; }
                .cp-img-grid.n3 { grid-template-columns: 1fr 1fr; }
                .cp-img-grid.n4 { grid-template-columns: 1fr 1fr; }

                .cp-img-item {
                    position: relative; border-radius: 12px;
                    overflow: hidden; background: #eeebe5; aspect-ratio: 1;
                }
                .dark .cp-img-item { background: #111d33; }
                .cp-img-grid.n3 .cp-img-item:first-child { grid-column: 1 / -1; aspect-ratio: 16/9; }
                .cp-img-grid.n1 .cp-img-item { aspect-ratio: 4/3; }

                .cp-img-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.4s ease; }
                .cp-img-item:hover img { transform: scale(1.04); }

                .cp-img-remove {
                    position: absolute; top: 7px; right: 7px;
                    width: 28px; height: 28px; border-radius: 50%;
                    background: rgba(0,0,0,0.6); border: none; color: #fff;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; backdrop-filter: blur(6px); transition: background 0.15s;
                }
                .cp-img-remove:hover { background: #ef4444; }

                /* Sticky toolbar */
                .cp-toolbar {
                    flex-shrink: 0; display: flex; align-items: center;
                    justify-content: space-between; padding: 10px 16px 14px;
                    border-top: 1px solid #eae7e1; background: #fafaf8;
                }
                .dark .cp-toolbar { background: #0b1222; border-color: #182035; }

                .cp-img-label {
                    width: 40px; height: 40px; border-radius: 11px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; color: #7c5cfc; transition: all 0.15s;
                }
                .cp-img-label:hover { background: rgba(124,92,252,0.1); transform: scale(1.08); }
                .cp-img-label:active { transform: scale(0.94); }

                .cp-char-count { font-size: 12px; color: #c8c4bc; font-weight: 500; }
                .cp-char-count.warn { color: #f59e0b; }
                .cp-char-count.danger { color: #ef4444; }
            `}</style>

            <div className="cp-root">
                {/* Top bar */}
                <div className="cp-topbar">
                    <button className="cp-back" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                    </button>
                    <span className="cp-page-title">New Post</span>
                    <button
                        className={`cp-post-btn ${canPost ? 'active' : 'inactive'}`}
                        onClick={handleSubmit}
                        disabled={!canPost}
                    >
                        {loading ? "Posting..." : "Post"}
                    </button>
                </div>

                {/* Card */}
                <div className="cp-card">
                    {/* Scrollable body */}
                    <div className="cp-body">
                        <div className="cp-user-row">
                            <img
                                src={user.profile_picture}
                                alt={`${user.full_name}'s profile`}
                                className="cp-avatar"
                            />
                            <div>
                                <div className="cp-user-name">{user.full_name}</div>
                                <div className="cp-user-handle">@{user.username}</div>
                            </div>
                        </div>

                        <div className="cp-divider" />

                        <textarea
                            className="cp-textarea"
                            placeholder="What's happening?"
                            onChange={(e) => setContent(e.target.value)}
                            value={content}
                            autoFocus
                        />

                        {/* Image previews */}
                        {images.length > 0 && (
                            <div className={`cp-img-grid n${count}`}>
                                {images.slice(0, 4).map((image, i) => (
                                    <div key={i} className="cp-img-item">
                                        <img src={URL.createObjectURL(image)} alt="Preview" />
                                        <button
                                            className="cp-img-remove"
                                            onClick={() => setImages(images.filter((_, index) => index !== i))}
                                        >
                                            <X size={14} strokeWidth={2.5} />
                                        </button>
                                        {i === 3 && images.length > 4 && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(0,0,0,0.52)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontFamily: 'Sora,sans-serif', fontSize: 26, fontWeight: 800
                                            }}>
                                                +{images.length - 4}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sticky bottom toolbar — never pushed off screen */}
                    <div className="cp-toolbar">
                        <label htmlFor="images" className="cp-img-label" title="Add image">
                            <ImageIcon size={22} />
                        </label>
                        {/* display:none instead of `hidden` — `hidden` blocks mobile file picker */}
                        <input
                            type="file"
                            accept="image/*"
                            id="images"
                            style={{ display: 'none' }}
                            multiple
                            onChange={(e) => {
                                if (e.target.files) {
                                    setImages([...images, ...Array.from(e.target.files)]);
                                }
                                e.target.value = '';
                            }}
                        />
                        <span className={`cp-char-count${content.length > 270 ? ' danger' : content.length > 240 ? ' warn' : ''}`}>
                            {content.length > 0 ? `${content.length} / 280` : ''}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CreatePost;