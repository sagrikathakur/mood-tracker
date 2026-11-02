import React from "react";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";
import PixelDither from "./PixelDither";
import assets from "../assets/asset";

export const PatternChecklist = () => {
  const { isAuthenticated } = useAuth();

  const checklistItems = [
    {
      title: "Root-cause awareness",
      desc: "Late-night git commits, context-switching, and sprint crunch tracked accurately — one pattern built on the last.",
    },
    {
      title: "Hints, not patronizing answers",
      desc: "Seven small restorative steps, from a 10-second breath to a 4-7-8 decompress, and only as far as you need.",
    },
    {
      title: "Room for every developer",
      desc: "Distraction-free interface, high-contrast dark mode support, and an authentic tone that respects your intelligence.",
    },
    {
      title: "Developers stay in the loop",
      desc: "A weekly synthesis note and a Correlation page show what triggered your exhaustion and where focus was restored.",
    },
  ];

  return (
    <section className="w-full bg-[#FCFAF4] text-slate-900 relative">
      {/* Top Pixel Dither from Emerald to Cream */}
      <PixelDither topColor="#0c2615" bottomColor="#FCFAF4" height={28} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display leading-[1.15]">
              Sustainable practices that protect{" "}
              <span className="text-emerald-700">your flow.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Calm Me asks &ldquo;what triggered this?&rdquo;, waits before it suggests, and never hands over preachy
              lectures. It gives developers a private space to decompress between merges and sprints.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0a1b10] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Try it yourself</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/about"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              >
                About Me
              </Link>
            </div>

            {/* Simple Artwork: Taking The Edge Off (Cover position, clean with no text) */}
            <div className="pt-2">
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white max-w-sm group">
                <img
                  src={assets.taking_edge_off}
                  alt="Taking The Edge Off · Developer Recovery"
                  className="w-full h-52 sm:h-60 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 4 Checklist Cards with Green Checkmarks (7 Cols - Frame 00:04) */}
          <div className="lg:col-span-7 space-y-3.5">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex items-start gap-4 transition-all hover:border-slate-300"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternChecklist;

