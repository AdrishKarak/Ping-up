import { useEffect, useState, useRef, useCallback } from "react";
import { X, Pause, Play, VolumeX, Volume2, ChevronLeft, ChevronRight } from "lucide-react";

const STORY_DURATION = 6000;
const PROGRESS_INTERVAL = 30;

const StoryViewer = ({ stories, currentIndex, setViewStory }) => {
    const [activeIndex, setActiveIndex] = useState(currentIndex);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isEntering, setIsEntering] = useState(true);
    const progressTimerRef = useRef(null);
    const videoRef = useRef(null);
    const startTimeRef = useRef(null);
    const pausedProgressRef = useRef(0);
    const progressRef = useRef(0);

    const currentStory = stories[activeIndex];
    const hasPrev = activeIndex > 0;
    const hasNext = activeIndex < stories.length - 1;

    useEffect(() => {
        progressRef.current = progress;
    }, [progress]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setViewStory(null);
        }, 300);
    }, [setViewStory]);

    // Reset progress when story changes
    const resetProgress = useCallback(() => {
        setProgress(0);
        pausedProgressRef.current = 0;
        startTimeRef.current = null;
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }
    }, []);

    const goToNext = useCallback(() => {
        if (hasNext) {
            resetProgress();
            setActiveIndex((i) => i + 1);
        } else {
            handleClose();
        }
    }, [hasNext, handleClose, resetProgress]);

    const goToPrev = useCallback(() => {
        if (hasPrev) {
            resetProgress();
            setActiveIndex((i) => i - 1);
        }
    }, [hasPrev, resetProgress]);

    // Time ago helper
    const getTimeAgo = (dateString) => {
        const now = new Date();
        const posted = new Date(dateString);
        const diffMs = now - posted;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return posted.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Progress bar timer for image/text stories
    useEffect(() => {
        if (currentStory.media_type === "video") return;

        if (isPaused) {
            pausedProgressRef.current = progressRef.current;
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
                progressTimerRef.current = null;
            }
            return;
        }

        startTimeRef.current = Date.now() - (pausedProgressRef.current / 100) * STORY_DURATION;

        progressTimerRef.current = setInterval(() => {
            const elapsed = Date.now() - startTimeRef.current;
            const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(progressTimerRef.current);
                goToNext();
            }
        }, PROGRESS_INTERVAL);

        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, [currentStory.media_type, isPaused, activeIndex, goToNext]);

    // Video progress tracking
    useEffect(() => {
        if (currentStory.media_type !== "video" || !videoRef.current) return;

        const video = videoRef.current;

        const handleTimeUpdate = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };

        const handleEnded = () => {
            setProgress(100);
            goToNext();
        };

        video.addEventListener("timeupdate", handleTimeUpdate);
        video.addEventListener("ended", handleEnded);

        return () => {
            video.removeEventListener("timeupdate", handleTimeUpdate);
            video.removeEventListener("ended", handleEnded);
        };
    }, [currentStory.media_type, goToNext, activeIndex]);

    // Handle video pause/play
    useEffect(() => {
        if (currentStory.media_type !== "video" || !videoRef.current) return;
        if (isPaused) {
            videoRef.current.pause();
        } else {
            videoRef.current.play().catch(() => {});
        }
    }, [isPaused, currentStory.media_type]);

    // Handle video mute
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Entry animation
    useEffect(() => {
        requestAnimationFrame(() => {
            setIsEntering(false);
        });
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") handleClose();
            if (e.key === " ") {
                e.preventDefault();
                setIsPaused((p) => !p);
            }
            if (e.key === "ArrowRight") goToNext();
            if (e.key === "ArrowLeft") goToPrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleClose, goToNext, goToPrev]);

    const togglePause = useCallback(() => {
        setIsPaused((p) => !p);
    }, []);

    const renderStoryContent = () => {
        switch (currentStory.media_type) {
            case "image":
                return (
                    <img
                        src={currentStory.media_url}
                        alt="story"
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                );
            case "video":
                return (
                    <video
                        ref={videoRef}
                        key={currentStory._id}
                        autoPlay
                        playsInline
                        muted={isMuted}
                        src={currentStory.media_url}
                        className="w-full h-full object-cover"
                    />
                );
            case "text":
                return (
                    <div
                        className="w-full h-full flex items-center justify-center p-10"
                        style={{ backgroundColor: currentStory.background_color || "#4f46e5" }}
                    >
                        <p className="text-white text-xl sm:text-2xl md:text-3xl leading-relaxed text-center font-medium drop-shadow-lg max-w-lg">
                            {currentStory.content}
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out ${
                isClosing ? "opacity-0 scale-95" : isEntering ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            style={{ backgroundColor: "rgba(0, 0, 0, 0.92)" }}
            onClick={handleClose}
        >
            {/* Left Navigation Arrow */}
            {hasPrev && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToPrev();
                    }}
                    className="absolute left-2 sm:left-6 z-50 p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    style={{
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                    }}
                >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
            )}

            {/* Right Navigation Arrow */}
            {hasNext && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        goToNext();
                    }}
                    className="absolute right-2 sm:right-6 z-50 p-2 sm:p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    style={{
                        background: "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(8px)",
                        border: "1px solid rgba(255,255,255,0.15)",
                    }}
                >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
            )}

            {/* Story Container */}
            <div
                className="relative w-full h-full sm:w-[420px] sm:h-[calc(100vh-40px)] sm:max-h-[780px] sm:rounded-2xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                style={{ userSelect: "none" }}
            >
                {/* Story Content (tap left/right halves to navigate) */}
                <div className="absolute inset-0 bg-gray-900">
                    {renderStoryContent()}
                </div>

                {/* Tap zones: left third = prev, middle = pause, right third = next */}
                <div className="absolute inset-0 z-10 flex">
                    <div
                        className="w-1/3 h-full cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (hasPrev) goToPrev();
                        }}
                    />
                    <div
                        className="w-1/3 h-full cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            togglePause();
                        }}
                    />
                    <div
                        className="w-1/3 h-full cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            goToNext();
                        }}
                    />
                </div>

                {/* Top Gradient Overlay */}
                <div
                    className="absolute inset-x-0 top-0 z-20 pointer-events-none"
                    style={{
                        height: "140px",
                        background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)",
                    }}
                />

                {/* Progress Bar */}
                <div className="absolute top-0 inset-x-0 z-30 px-3 pt-2.5">
                    <div className="flex gap-1">
                        {stories.map((_, idx) => (
                            <div
                                key={idx}
                                className="flex-1 h-[3px] rounded-full overflow-hidden"
                                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width:
                                            idx < activeIndex
                                                ? "100%"
                                                : idx === activeIndex
                                                ? `${progress}%`
                                                : "0%",
                                        background: "linear-gradient(90deg, #a78bfa, #818cf8, #6366f1)",
                                        boxShadow: idx === activeIndex ? "0 0 8px rgba(139, 92, 246, 0.5)" : "none",
                                        transition: idx === activeIndex ? "none" : "width 0.3s ease",
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Info Header */}
                <div className="absolute top-0 inset-x-0 z-30 px-3 pt-5 pb-2">
                    <div className="flex items-center justify-between">
                        {/* Left: Profile Picture + Name + Time */}
                        <div className="flex items-center gap-3">
                            {/* Profile Picture with gradient ring */}
                            <div className="relative shrink-0">
                                <div
                                    className="w-10 h-10 rounded-full p-[2px]"
                                    style={{
                                        background: "linear-gradient(135deg, #6366f1, #a78bfa, #c084fc)",
                                    }}
                                >
                                    <img
                                        src={currentStory.user?.profile_picture}
                                        alt={currentStory.user?.full_name}
                                        className="w-full h-full rounded-full object-cover border-2 border-black"
                                    />
                                </div>
                                {/* Online indicator */}
                                <span
                                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black"
                                    style={{ backgroundColor: "#22c55e" }}
                                />
                            </div>

                            {/* Name & Time */}
                            <div className="flex flex-col">
                                <span className="text-white text-sm font-semibold leading-tight tracking-wide">
                                    {currentStory.user?.full_name}
                                </span>
                                <span className="text-gray-300 text-xs leading-tight mt-0.5" style={{ fontSize: "11px" }}>
                                    {getTimeAgo(currentStory.createdAt)}
                                </span>
                            </div>
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-1">
                            {/* Pause / Play */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePause();
                                }}
                                className="p-2 rounded-full transition-colors hover:bg-white/10 active:bg-white/20 cursor-pointer"
                            >
                                {isPaused ? (
                                    <Play className="w-4 h-4 text-white fill-white" />
                                ) : (
                                    <Pause className="w-4 h-4 text-white fill-white" />
                                )}
                            </button>

                            {/* Mute / Unmute (only for video) */}
                            {currentStory.media_type === "video" && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsMuted((m) => !m);
                                    }}
                                    className="p-2 rounded-full transition-colors hover:bg-white/10 active:bg-white/20 cursor-pointer"
                                >
                                    {isMuted ? (
                                        <VolumeX className="w-4 h-4 text-white" />
                                    ) : (
                                        <Volume2 className="w-4 h-4 text-white" />
                                    )}
                                </button>
                            )}

                            {/* Close */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="p-2 rounded-full transition-colors hover:bg-white/10 active:bg-white/20 cursor-pointer"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Gradient Overlay */}
                <div
                    className="absolute inset-x-0 bottom-0 z-20 pointer-events-none"
                    style={{
                        height: "80px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
                    }}
                />

                {/* Paused Indicator */}
                {isPaused && (
                    <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
                        >
                            <Pause className="w-7 h-7 text-white fill-white" />
                        </div>
                    </div>
                )}

                {/* Story counter badge */}
                <div className="absolute bottom-4 inset-x-0 z-30 flex justify-center pointer-events-none">
                    <span
                        className="text-xs font-medium px-3 py-1 rounded-full"
                        style={{
                            color: "rgba(255,255,255,0.7)",
                            background: "rgba(0,0,0,0.35)",
                            backdropFilter: "blur(4px)",
                        }}
                    >
                        {activeIndex + 1} / {stories.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default StoryViewer;
