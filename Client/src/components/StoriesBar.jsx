import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { dummyStoriesData } from "../assets/assets";
import StoryModal from "./StoryModal";
import StoryViewer from "./StoryViewer";


const StoriesBar = () => {
    const [stories, setStories] = useState([]);
    const [showStoryModal, setShowStoryModal] = useState(false);
    const [viewStoryIndex, setViewStoryIndex] = useState(null)
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const fetchStories = async () => {
        setStories(dummyStoriesData);
    }

    useEffect(() => {
        fetchStories();
    }, [])

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    };

    const scroll = (direction) => {
        if (!scrollContainerRef.current) return;
        const scrollAmount = direction === "left" ? -300 : 300;
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    };
    return (
        <div className="relative w-screen sm:w-[calc(100vw-240px)] lg:max-w-2xl px-4 group/slider">
            {showLeftArrow && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-6 top-[calc(50%-10px)] -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center opacity-0 group-hover/slider:opacity-100"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {showRightArrow && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-6 top-[calc(50%-10px)] -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-1.5 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center opacity-0 group-hover/slider:opacity-100"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            )}

            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex gap-4 pb-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            >
                {/*Add story */}
                <div onClick={() => setShowStoryModal(true)} className="rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-3/4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-linear-to-b from-indigo-100 to-white shrink-0">
                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className="size-10 bg-violet-700 rounded-full flex items-center justify-center mb-3">
                            <Plus className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm font-medium text-slate-700 text-center">Add Story</p>
                    </div>
                </div>
                {/*map through stories */}
                {stories.map((story, index) => (
                    <div onClick={() => setViewStoryIndex(index)} key={story._id || index} className="relative rounded-lg shadow-sm min-w-30 max-w-30 max-h-40 aspect-3/4 cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden group shrink-0">
                        {story.media_type === "image" && (
                            <img src={story.media_url} alt="story" className="w-full h-full object-cover" />
                        )}
                        {story.media_type === "video" && (
                            <video src={story.media_url} className="w-full h-full object-cover" />
                        )}
                        {story.media_type === "text" && (
                            <div className="w-full h-full flex items-center justify-center p-2" style={{ backgroundColor: story.background_color }}>
                                <p className="text-white text-xs text-center line-clamp-4">{story.content}</p>
                            </div>
                        )}

                        <div className="absolute top-2 left-2 ring-2 ring-indigo-500 rounded-full">
                            <img src={story.user.profile_picture} alt={story.user.full_name} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                        </div>
                        <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent p-2 pt-6">
                            <p className="text-white text-xs font-medium truncate">{story.user.full_name}</p>
                        </div>
                    </div>
                ))}
            </div>
            {/* ADD story modal */}
            {showStoryModal && <StoryModal setShowStoryModal={setShowStoryModal} fetchStories={fetchStories} />}
            {/*view story modal */}
            {viewStoryIndex !== null && <StoryViewer stories={stories} currentIndex={viewStoryIndex} setViewStory={setViewStoryIndex} />}
        </div>
    )
};

export default StoriesBar;