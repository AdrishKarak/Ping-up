import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';

const ImageModal = ({ images, currentIndex, onClose, onNavigate }) => {
    if (!images || images.length === 0) return null;

    const currentImage = images[currentIndex];

    // Handle background click (close modal)
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-100 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-10"
                onClick={handleBackdropClick}
            >
                {/* ── Header Controls ── */}
                <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white/90 text-xs font-bold tracking-widest uppercase">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pointer-events-auto">
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/10 transition-all active:scale-90"
                            title="Close"
                        >
                            <X size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* ── Main Image Container ── */}
                <div className="relative w-full h-full flex items-center justify-center">
                    <Motion.img
                        key={currentImage}
                        src={currentImage}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        alt="Full size preview"
                        className="max-h-full max-w-full object-contain shadow-2xl rounded-sm"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* ── Navigation Arrows ── */}
                    {images.length > 1 && (
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 sm:px-6 pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex - 1 + images.length) % images.length); }}
                                className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5 transition-all active:scale-90 pointer-events-auto disabled:opacity-30"
                                title="Previous"
                            >
                                <ChevronLeft size={28} strokeWidth={2.5} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onNavigate((currentIndex + 1) % images.length); }}
                                className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5 transition-all active:scale-90 pointer-events-auto disabled:opacity-30"
                                title="Next"
                            >
                                <ChevronRight size={28} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Thumbnail Strip (Optional, for 2+ images) ── */}
                {images.length > 1 && (
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-x-auto no-scrollbar max-w-full">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); onNavigate(idx); }}
                                className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === currentIndex ? 'border-purple-500 scale-110 shadow-lg shadow-purple-500/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                            >
                                <img src={img} className="w-full h-full object-cover" alt="" />
                            </button>
                        ))}
                    </div>
                )}
            </Motion.div>
        </AnimatePresence>
    );
};

export default ImageModal;
