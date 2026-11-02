import React, { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { devArtworkGallery } from "../assets/asset";
import { sounds } from "../utils/soundEffects";

export const PatternArtGallery = () => {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <section className="w-full bg-[#08150c] text-white py-16 sm:py-20 px-4 sm:px-8 border-t border-emerald-950/70">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Simple Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display tracking-tight">
            Developer Art Gallery
          </h2>
          <p className="text-xs sm:text-sm text-emerald-300/70 font-normal">
            Moments of developer burnout, late-night code fatigue, and gentle recovery.
          </p>
        </div>

        {/* Simple Clean Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {devArtworkGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                sounds.playPop(480);
                setActiveImage(item);
              }}
              className="group relative rounded-2xl overflow-hidden bg-[#0c2415] border border-emerald-900/50 hover:border-emerald-500/60 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1"
            >
              <div className="aspect-square w-full overflow-hidden bg-black/40">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Minimal Clean Caption */}
              <div className="p-3 text-center bg-[#0d2616] border-t border-emerald-900/40">
                <p className="text-xs font-bold text-white group-hover:text-[#64DC4C] transition-colors truncate">
                  {item.title}
                </p>
              </div>

              {/* Hover Zoom Icon */}
              <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Clean Minimal Lightbox Modal */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={() => setActiveImage(null)}
          >
            <div
              className="relative max-w-lg w-full bg-[#0c2615] rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl p-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveImage(null);
                }}
                className="absolute top-5 right-5 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center cursor-pointer transition"
                aria-label="Close image modal"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="rounded-2xl overflow-hidden aspect-square max-h-[70vh] bg-black">
                <img
                  src={activeImage.src}
                  alt={activeImage.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 text-center space-y-1">
                <h3 className="text-base font-bold text-white font-display">
                  {activeImage.title}
                </h3>
                <p className="text-xs text-emerald-300/70">
                  {activeImage.subtitle}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PatternArtGallery;
