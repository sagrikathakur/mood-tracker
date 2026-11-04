import React, { useState, useEffect } from "react";
import { Sparkles, Heart, Coffee, Shield } from "lucide-react";
import { PixelFrog } from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";

const DEV_WISDOMS = [
  "Ribbit! Hydrate & roll your shoulders 🍵",
  "Don't push straight to main on a Friday afternoon 🚀",
  "Complex bugs untangle themselves after a 5-minute walk.",
  "Your IDE will still be here. Step outside and see the trees 🌲",
  "Code is poetry, but rest is architecture.",
  "Breathe in for 4 seconds... exhale slowly for 4 seconds.",
  "Every senior engineer once stared at the exact same error.",
  "Remember to unclench your jaw and soften your gaze.",
];

export const SanctuaryDeskPet = () => {
  const [level, setLevel] = useState(() => {
    return parseInt(localStorage.getItem("calmme_pet_level") || "1", 10);
  });
  const [xp, setXp] = useState(() => {
    return parseInt(localStorage.getItem("calmme_pet_xp") || "0", 10);
  });
  const [speechIdx, setSpeechIdx] = useState(0);
  const [isPetting, setIsPetting] = useState(false);
  const [hearts, setHearts] = useState([]);

  // Rotate wisdom every 25 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeechIdx((prev) => (prev + 1) % DEV_WISDOMS.length);
    }, 25000);
    return () => clearInterval(timer);
  }, []);

  const handlePet = () => {
    sounds.playSuccess();
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 350);

    // Spawn floating heart
    const id = Date.now();
    setHearts((prev) => [...prev, id]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h !== id));
    }, 1200);

    // Gain XP
    const newXp = xp + 15;
    if (newXp >= 100) {
      setLevel((prev) => {
        const nextLvl = prev + 1;
        localStorage.setItem("calmme_pet_level", String(nextLvl));
        return nextLvl;
      });
      setXp(0);
      localStorage.setItem("calmme_pet_xp", "0");
      sounds.playCelebration();
    } else {
      setXp(newXp);
      localStorage.setItem("calmme_pet_xp", String(newXp));
    }
  };

  return (
    <div className="relative p-3.5 rounded-2xl bg-white/95 border border-slate-200/90 shadow-2xs space-y-2 select-none group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Desk Companion
          </span>
          <span className="text-[10px] text-slate-300">·</span>
          <span className="text-[10px] font-bold text-emerald-800 font-mono">HOPPY</span>
        </div>

        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-200">
          LVL {level}
        </span>
      </div>

      {/* Pet Interaction Body */}
      <div className="flex items-center gap-3">
        {/* Clickable Pixel Art Frog */}
        <div
          onClick={handlePet}
          title="Click to pet Hoppy!"
          className={`relative w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center cursor-pointer transition-transform hover:scale-110 active:scale-95 shrink-0 ${
            isPetting ? "animate-bounce" : ""
          }`}
        >
          <PixelFrog className="w-8 h-8" />

          {/* Floating Hearts Animation */}
          {hearts.map((hId) => (
            <span
              key={hId}
              className="absolute -top-3 text-rose-500 animate-out fade-out slide-out-to-top duration-1000 text-xs pointer-events-none"
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Speech Bubble */}
        <div
          onClick={() => setSpeechIdx((prev) => (prev + 1) % DEV_WISDOMS.length)}
          className="flex-1 min-w-0 bg-slate-50 hover:bg-slate-100/80 p-2 rounded-xl border border-slate-200/60 cursor-pointer transition-colors"
          title="Click for next developer wisdom"
        >
          <p className="text-[11px] font-medium text-slate-700 leading-snug line-clamp-2">
            {DEV_WISDOMS[speechIdx]}
          </p>
        </div>
      </div>

      {/* Companion Bonding XP Bar */}
      <div className="space-y-0.5 pt-0.5">
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 font-bold">
          <span>Bonding</span>
          <span>{xp}%</span>
        </div>
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${xp}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default SanctuaryDeskPet;

