import React, { useState } from "react";
import {
  PixelFox,
  PixelOwl,
  PixelPineTree,
  PixelCloud,
  PixelGrassTuft,
} from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { motion } from "../utils/motion";

export const MeadowHero = () => {
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
    <section className="relative w-full h-screen h-[100dvh] min-h-[100vh] max-h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#90D786] select-none">
      {/* 1. Sky & Pixel Clouds Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Floating Clouds */}
        <div className="absolute top-14 left-8 opacity-90 animate-pulse duration-1000">
          <PixelCloud className="w-28 h-14" />
        </div>
        <div className="absolute top-20 right-14 opacity-80 hidden sm:block">
          <PixelCloud className="w-32 h-16" />
        </div>
        <div className="absolute top-28 left-1/3 opacity-70 hidden md:block">
          <PixelCloud className="w-24 h-12" />
        </div>

        {/* Scattered Pine Trees on Left Meadow Flank */}
        <div className="absolute bottom-24 left-4 sm:left-10 flex items-end gap-3 opacity-95">
          <PixelPineTree className="w-10 h-16" />
          <PixelPineTree className="w-8 h-12 hidden sm:block" />
          <PixelPineTree className="w-12 h-20 hidden md:block" />
        </div>

        {/* Scattered Pine Trees on Right Meadow Flank */}
        <div className="absolute bottom-24 right-4 sm:right-10 flex items-end gap-3 opacity-95">
          <PixelPineTree className="w-8 h-12 hidden sm:block" />
          <PixelPineTree className="w-12 h-20" />
          <PixelPineTree className="w-10 h-16 hidden md:block" />
        </div>

        {/* Scattered Grass Blades */}
        <div className="absolute bottom-28 left-1/4 opacity-40">
          <PixelGrassTuft className="w-4 h-4 text-emerald-900" />
        </div>
        <div className="absolute bottom-32 right-1/4 opacity-40">
          <PixelGrassTuft className="w-4 h-4 text-emerald-900" />
        </div>
        <div className="absolute bottom-36 left-1/2 opacity-30">
          <PixelGrassTuft className="w-4 h-4 text-emerald-900" />
        </div>
      </div>

      {/* 2. Main Hero Content (Vertically Balanced in Available Viewport Space) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-22 pb-2 text-center flex-1 flex flex-col justify-center items-center space-y-3 sm:space-y-4">
        {/* Headline */}
        <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
          <h1 className="text-2xl sm:text-4xl lg:text-[50px] font-black text-slate-950 tracking-tight font-display leading-[1.12]">
            Decode your burnout.{" "}
            <span className="text-[#134e27] underline decoration-[#134e27]/30 decoration-wavy underline-offset-6">
              Reclaim your calm.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 font-medium max-w-lg mx-auto leading-relaxed">
            A private, encrypted sanctuary engineered by developer{" "}
            <strong className="text-slate-950 font-bold">Sagrika</strong> to help developers track sprint exhaustion,
            isolate debugging triggers, and gently restore cognitive focus.
          </p>
        </div>
      </div>

      {/* 3. Center Meadow Companions (Fox & Owl with Pixel Speech Bubbles) */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 pb-2 sm:pb-3 flex items-end justify-center gap-8 sm:gap-14 shrink-0">
        {/* Fox */}
        <motion.div
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center group cursor-pointer"
          onClick={handleFoxClick}
        >
          <div className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] sm:text-xs font-bold py-1 px-3 rounded-xl shadow-[2px_2px_0px_#000] mb-1.5 max-w-[160px] text-center animate-bubble-bounce transition-transform group-hover:-translate-y-1">
            {foxMessage}
          </div>
          <div className="relative">
            <PixelFox className="w-14 h-14 sm:w-16 sm:h-16" />
            <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider block text-center mt-0.5">
              Foxy · Breath
            </span>
          </div>
        </motion.div>

        {/* Owl */}
        <motion.div
          whileHover={{ scale: 1.05, y: -3 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center group cursor-pointer"
          onClick={handleOwlClick}
        >
          <div className="bg-white border-2 border-slate-900 text-slate-900 text-[11px] sm:text-xs font-bold py-1 px-3 rounded-xl shadow-[2px_2px_0px_#000] mb-1.5 max-w-[160px] text-center animate-bubble-bounce transition-transform group-hover:-translate-y-1">
            {owlMessage}
          </div>
          <div className="relative">
            <PixelOwl className="w-14 h-14 sm:w-16 sm:h-16" />
            <span className="text-[10px] font-extrabold text-emerald-950 uppercase tracking-wider block text-center mt-0.5">
              Sage · Wisdom
            </span>
          </div>
        </motion.div>
      </div>

    </section>
  );
};

export default MeadowHero;
