import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Code2, ShieldCheck, Heart } from "lucide-react";
import {
  PixelFox,
  PixelOwl,
  PixelPineTree,
  PixelCloud,
  PixelGrassTuft,
} from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

export const MeadowHero = () => {
  const { isAuthenticated } = useAuth();
  const [foxMessage, setFoxMessage] = useState("High five! Take a deep breath 🌿");
  const [owlMessage, setOwlMessage] = useState("Hello there! Welcome to Calm Me ✨");

  const handleFoxClick = () => {
    sounds.playPop(480);
    const msgs = [
      "Inhale slowly for 4 seconds... 🌬️",
      "You don't have to fix every bug today. 🌿",
      "Drink a sip of water, developer friend! 💧",
      "High five! Your peace matters more than story points. 🦊",
    ];
    setFoxMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  };

  const handleOwlClick = () => {
    sounds.playCalmTone(520, 0.4);
    const msgs = [
      "Welcome to your sanctuary! ✨",
      "Step away from the screen for 2 minutes. 🦉",
      "Built with care by Sagrika for tech minds. 💚",
      "A calm mind writes the cleanest code. 🌲",
    ];
    setOwlMessage(msgs[Math.floor(Math.random() * msgs.length)]);
  };

  return (
    <section className="relative w-full h-[100vh] min-h-[100vh] max-h-[100vh] flex flex-col justify-between overflow-hidden bg-[#90D786] select-none">
      {/* 1. Sky & Pixel Clouds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Clouds */}
        <div className="absolute top-14 left-8 opacity-90 animate-pulse duration-1000">
          <PixelCloud className="w-28 h-14" />
        </div>
        <div className="absolute top-24 right-16 opacity-80 hidden sm:block">
          <PixelCloud className="w-36 h-18" />
        </div>
        <div className="absolute top-36 left-1/3 opacity-70 hidden md:block">
          <PixelCloud className="w-24 h-12" />
        </div>

        {/* Scattered Pine Trees on Left Meadow Flank */}
        <div className="absolute bottom-28 left-4 sm:left-10 flex items-end gap-3 opacity-95">
          <PixelPineTree className="w-12 h-20" />
          <PixelPineTree className="w-9 h-14 hidden sm:block" />
          <PixelPineTree className="w-14 h-24 hidden md:block" />
        </div>

        {/* Scattered Pine Trees on Right Meadow Flank */}
        <div className="absolute bottom-28 right-4 sm:right-10 flex items-end gap-3 opacity-95">
          <PixelPineTree className="w-9 h-14 hidden sm:block" />
          <PixelPineTree className="w-14 h-24" />
          <PixelPineTree className="w-11 h-18 hidden md:block" />
        </div>

        {/* Scattered Grass Blades */}
        <div className="absolute bottom-36 left-1/4 opacity-40">
          <PixelGrassTuft className="w-5 h-5 text-emerald-900" />
        </div>
        <div className="absolute bottom-40 right-1/4 opacity-40">
          <PixelGrassTuft className="w-5 h-5 text-emerald-900" />
        </div>
        <div className="absolute bottom-48 left-1/2 opacity-30">
          <PixelGrassTuft className="w-4 h-4 text-emerald-900" />
        </div>
      </div>

      {/* 2. Main Hero Content (Headline, Badge, CTAs) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 text-center flex flex-col items-center space-y-4">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-emerald-900 border border-emerald-900/15 text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Calm Me · Developer Burnout Sanctuary by Sagrika</span>
        </div>

        {/* Headline */}
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight font-display leading-[1.1]">
            Decode your burnout.{" "}
            <span className="text-[#134e27] underline decoration-[#134e27]/30 decoration-wavy underline-offset-8">
              Reclaim your calm.
            </span>
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-800 font-medium max-w-xl mx-auto leading-relaxed pt-1">
            A private, encrypted sanctuary engineered by developer{" "}
            <strong className="text-slate-950 font-bold">Sagrika</strong> to help developers track sprint exhaustion,
            isolate debugging triggers, and gently restore cognitive focus.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 w-full max-w-xs sm:max-w-none">
          <Link
            to={isAuthenticated ? "/tracker" : "/login"}
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#0a1b10] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/15 transition-all duration-200 cursor-pointer"
          >
            <span>Open Sanctuary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#about"
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/95 hover:bg-white text-slate-900 text-xs sm:text-sm font-bold border border-emerald-900/20 shadow-xs transition-all duration-200 cursor-pointer"
          >
            About Sagrika&apos;s Story
          </a>
        </div>
      </div>

      {/* 3. Center Meadow Companions (Fox & Owl with Pixel Speech Bubbles) */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 pb-2 flex items-end justify-center gap-8 sm:gap-16">
        {/* Fox */}
        <div className="flex flex-col items-center group cursor-pointer" onClick={handleFoxClick}>
          <div className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] sm:text-xs font-bold py-1 px-3 rounded-xl shadow-[2px_2px_0px_#000] mb-2 max-w-[170px] text-center transition-transform group-hover:-translate-y-1">
            {foxMessage}
          </div>
          <div className="relative">
            <PixelFox className="w-16 h-16 sm:w-20 sm:h-20" />
            <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider block text-center mt-0.5">
              Foxy · Breath
            </span>
          </div>
        </div>

        {/* Owl */}
        <div className="flex flex-col items-center group cursor-pointer" onClick={handleOwlClick}>
          <div className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] sm:text-xs font-bold py-1 px-3 rounded-xl shadow-[2px_2px_0px_#000] mb-2 max-w-[170px] text-center transition-transform group-hover:-translate-y-1">
            {owlMessage}
          </div>
          <div className="relative">
            <PixelOwl className="w-16 h-16 sm:w-20 sm:h-20" />
            <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider block text-center mt-0.5">
              Sage · Wisdom
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom 4-Column Ticker (Matches Frame 00:00 of Reference Video) */}
      <div className="relative z-10 w-full bg-[#091b10] text-white border-t-2 border-emerald-950/60 py-3 sm:py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-left">
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-white font-display">Sprint & Bug Fatigue</h4>
            <p className="text-[11px] sm:text-xs text-emerald-400/90 font-medium leading-tight">
              Track burnout patterns across release cycles
            </p>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-white font-display">Root-Cause Triggers</h4>
            <p className="text-[11px] sm:text-xs text-emerald-400/90 font-medium leading-tight">
              Isolate late-night debugging & broken builds
            </p>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-white font-display">Paced Calming Resets</h4>
            <p className="text-[11px] sm:text-xs text-emerald-400/90 font-medium leading-tight">
              Box breathing & 5-4-3-2-1 sensory grounding
            </p>
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-black text-white font-display">100% Client-Encrypted</h4>
            <p className="text-[11px] sm:text-xs text-emerald-400/90 font-medium leading-tight">
              Zero trackers, zero ads, protected behind PIN
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeadowHero;

