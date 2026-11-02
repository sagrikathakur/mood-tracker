import React, { useState } from "react";
import { Sparkles, MessageCircle, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { PixelOwl, PixelHeart, PixelStar } from "./PixelIcons";
import { sounds } from "../utils/soundEffects";

const COMPANION_PROMPTS = [
  "Hoo-hoo! Did you take a slow, quiet breath today?",
  "Feelings are like clouds in the sky. They drift by without defining your soul.",
  "You don't need to finish everything today. Being gentle with yourself is victory enough.",
  "A sip of water, rolled shoulders, and one mindful breath. Little resets matter!",
  "Honor your rhythm. Some days are for soaring high, some days are for quiet nesting.",
  "What is one tiny ordinary comfort you noticed today? A warm mug, soft breeze, or quiet room?",
];

const KizuCompanion = ({ userName = "Friend", streakCount = 3 }) => {
  const [promptIndex, setPromptIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(sounds.isMuted);

  const cyclePrompt = () => {
    sounds.playClick();
    setPromptIndex((prev) => (prev + 1) % COMPANION_PROMPTS.length);
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playSuccess();
  };

  return (
    <div className="pixel-card bg-white p-5 sm:p-7 relative overflow-hidden transition-all duration-200">
      {/* Top Banner Row */}
      <div className="flex items-center justify-between gap-3 mb-4 border-b-2 border-[#18181B] pb-3">
        <div className="flex items-center gap-2">
          <span className="pixel-badge bg-[#FACC15] text-[#18181B] font-pixel text-[10px]">
            LEVEL 3 · MINDFUL EXPLORER
          </span>
          <span className="hidden sm:inline-flex pixel-badge bg-[#C084FC] text-[#18181B] font-pixel text-[10px]">
            +20 XP TODAY
          </span>
        </div>

        {/* Audio FX Toggle */}
        <button
          onClick={handleToggleSound}
          className="pixel-btn bg-white hover:bg-slate-100 py-1 px-2.5 text-xs font-pixel flex items-center gap-1.5 shadow-[2px_2px_0px_#18181B]"
          title={isMuted ? "Unmute Retro Chimes" : "Mute Sound"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-[#22C55E]" />}
          <span className="text-[10px]">{isMuted ? "MUTED" : "SOUND ON"}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          {/* Pixel Owl Avatar Box */}
          <div className="relative flex-shrink-0 cursor-pointer" onClick={cyclePrompt} title="Click Kizu for wisdom!">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#DCFCE7] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex items-center justify-center">
              <PixelOwl className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <span className="absolute -bottom-2 -right-1 font-pixel text-[9px] bg-[#FACC15] border-2 border-[#18181B] px-1.5 py-0.5 rounded shadow-[1.5px_1.5px_0px_#18181B]">
              KIZU
            </span>
          </div>

          {/* Dialogue Speech Box */}
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              Welcome back, {userName}! 🌿
            </h2>

            {/* Retro RPG Dialogue Box */}
            <div className="relative bg-[#FAF8F5] border-2 border-[#18181B] rounded-xl px-4 py-3 shadow-[2.5px_2.5px_0px_#18181B] max-w-lg">
              <p className="text-xs sm:text-sm font-bold text-[#27272A] leading-relaxed">
                "{COMPANION_PROMPTS[promptIndex]}"
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={cyclePrompt}
          className="pixel-btn pixel-btn-yellow text-xs font-pixel py-2.5 px-4 whitespace-nowrap self-stretch sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>NEW WISDOM</span>
        </button>
      </div>
    </div>
  );
};

export default KizuCompanion;

