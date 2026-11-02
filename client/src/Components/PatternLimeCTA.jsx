import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PixelOwl } from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";
import { motion } from "../utils/motion";
import PixelDither from "./PixelDither";

export const PatternLimeCTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="w-full bg-[#64DC4C] text-slate-950 relative text-center">
      {/* Top Pixel Dither from Cream to Lime */}
      <PixelDither topColor="#FCFAF4" bottomColor="#64DC4C" height={28} />

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-20 sm:py-24 space-y-6 flex flex-col items-center">
        {/* Pixel Owl Center Mascot */}
        <motion.div
          whileHover={{ scale: 1.08, y: -4 }}
          whileTap={{ scale: 0.94 }}
          className="flex flex-col items-center group cursor-pointer"
          onClick={() => sounds.playPop(520)}
        >
          <div className="bg-white border-2 border-slate-900 text-slate-900 text-xs font-bold py-1 px-3 rounded-xl shadow-[2px_2px_0px_#000] mb-2 text-center animate-bubble-bounce transition-transform group-hover:-translate-y-1">
            Ready when you are! 🌿
          </div>
          <PixelOwl className="w-16 h-16 sm:w-20 sm:h-20" />
        </motion.div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight font-display">
            Say hello to Calm Me.
          </h2>
          <p className="text-sm sm:text-base text-slate-900 font-semibold max-w-lg mx-auto">
            Set up your developer sanctuary in a minute. Calm Me takes it from there.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none">
          <Link
            to={isAuthenticated ? "/tracker" : "/login"}
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#0a1b10] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/15 transition-all cursor-pointer"
          >
            <span>Start tracking for free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold border border-black/15 transition-all cursor-pointer shadow-xs"
          >
            About Me
          </Link>
        </div>

        {/* Subtext and Badges (Frame 00:09 - 00:10) */}
        <div className="space-y-2 pt-2">
          <p className="text-xs text-slate-800 font-semibold">
            100% Free forever · No credit card · Client-encrypted
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-bold text-slate-900">
            <span>• 100% Client Encrypted</span>
            <span>• Zero Ads, No Trackers</span>
            <span>• Built for Software Engineers</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternLimeCTA;

