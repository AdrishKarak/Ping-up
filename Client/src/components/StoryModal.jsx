import { ArrowLeft, Type, Image as ImageIcon, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const StoryModal = ({ setShowStoryModal }) => {
    const bgcolors = ["#4f46e5", "#7c3aed", "#db2777", "#e11d48", "#ca8a04", "#0d9488", "#222222"]

    const [mode, setMode] = useState("text");
    const [background, setBackground] = useState(bgcolors[0]);
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [previwUrl, setPreviewUrl] = useState(null);
    const [isCreating] = useState(false);

    const handleMediaChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    const handleCreateStory = async () => {
    }

    return (
        <div className="fixed inset-0 z-110 min-h-screen bg-black/80 backdrop-blur-md text-white flex items-center justify-center p-4">
            <div className="w-full max-w-md h-full max-h-[85vh] flex flex-col relative overflow-hidden">

                {/* Header */}
                <div className="text-center mb-6 flex items-center justify-between shrink-0">
                    <button onClick={() => setShowStoryModal(false)} className="text-white p-2 rounded-full hover:bg-white/10 transition cursor-pointer">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-xl font-semibold">Create Story</h2>
                    <span className="w-10"></span>
                </div>

                {/* Content Area */}
                <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-36">

                    {/* Preview Box */}
                    <div className="flex justify-center mb-8">
                        <div
                            className="w-64 h-104 rounded-xl overflow-hidden relative shadow-2xl transition-all duration-300 flex items-center justify-center border border-white/10 shrink-0"
                            style={{ backgroundColor: mode === "text" ? background : "#111" }}
                        >
                            {mode === "text" ? (
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type something..."
                                    className="w-full bg-transparent text-white text-center text-2xl font-medium placeholder-white/60 outline-none resize-none px-6"
                                    rows={5}
                                    maxLength={150}
                                    autoFocus
                                />
                            ) : previwUrl ? (
                                media?.type?.includes("video") ? (
                                    <video src={previwUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                                ) : (
                                    <img src={previwUrl} className="w-full h-full object-cover" alt="preview" />
                                )
                            ) : (
                                <div className="text-white/50 flex flex-col items-center">
                                    <label className="cursor-pointer flex flex-col items-center p-6 border-2 border-dashed border-white/20 rounded-xl hover:border-white/50 hover:text-white/80 transition-all bg-white/5">
                                        <ImageIcon className="w-12 h-12 mb-3" strokeWidth={1.5} />
                                        <span className="font-medium text-sm">Select Media</span>
                                        <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaChange} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-8 px-2 shrink-0">
                        {/* Mode Toggle Tabs */}
                        <div className="flex bg-white/10 rounded-xl p-1 shadow-inner">
                            <button
                                onClick={() => setMode("text")}
                                className={`flex-1 py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all duration-200 text-sm font-medium ${mode === "text" ? "bg-white text-black shadow-sm" : "text-white/80 hover:text-white hover:bg-white/5"}`}
                            >
                                <Type size={18} /> Text
                            </button>
                            <button
                                onClick={() => setMode("media")}
                                className={`flex-1 py-2.5 rounded-lg flex justify-center items-center gap-2 transition-all duration-200 text-sm font-medium ${mode === "media" ? "bg-white text-black shadow-sm" : "text-white/80 hover:text-white hover:bg-white/5"}`}
                            >
                                <ImageIcon size={18} /> Media
                            </button>
                        </div>

                        {/* Color Pickers (Only for Text Mode) */}
                        {mode === "text" && (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">

                                <div className="flex gap-4 justify-center flex-wrap">
                                    {bgcolors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setBackground(color)}
                                            className={`w-10 h-10 rounded-full transition-all duration-200 shadow-md ${background === color ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Change Media Option (Only for Media Mode with URL) */}
                        {mode === "media" && previwUrl && (
                            <div className="flex justify-center animate-in fade-in duration-300">
                                <label className="cursor-pointer bg-white/10 hover:bg-white/20 transition-all px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium shadow-sm">
                                    <ImageIcon size={18} /> Change Media
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleMediaChange} />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer fixed button */}
                <div className="absolute bottom-0 inset-x-0 pt-16 pb-4 flex justify-center z-20 pointer-events-none">
                    <button
                        onClick={() => toast.promise(handleCreateStory(), {
                            loading: "Creating story...",
                            success: <p>Story created successfully!</p>,
                            error: e => <p>{e.message}</p>
                        })}
                        disabled={isCreating || (mode === "text" ? !text.trim() : !media)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 pointer-events-auto"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Send size={18} className="-ml-1" />
                                Add to Story
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
};

export default StoryModal;
