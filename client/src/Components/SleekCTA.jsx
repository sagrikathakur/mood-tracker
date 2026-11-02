import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, Heart, Code2 } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

const SleekCTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-gradient-to-b from-white to-[#F0FDF4]/50 text-slate-900 border-t border-slate-200/80 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="aura-glow w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-400/15" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-emerald-200 text-emerald-800 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Calm Me · Built for Developers by Sagrika</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-display text-slate-900">
          Your code matters.{" "}
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Your peace matters more.
          </span>
        </h2>

        <p className="text-sm sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
          Begin logging your daily developer baseline, discover the real reasons behind your burnout, and restore sustainable flow.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={isAuthenticated ? "/tracker" : "/login"}
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xl shadow-slate-900/15 hover:bg-emerald-600 transition-all cursor-pointer"
          >
            <span>Open Developer Sanctuary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#about"
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-white text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
          >
            Read Sagrika's Story
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400 pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            100% Free & Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-emerald-600" />
            Zero Tracking Cookies
          </span>
          <span className="flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Built with Love by Sagrika
          </span>
        </div>
      </div>
    </section>
  );
};

export default SleekCTA;
