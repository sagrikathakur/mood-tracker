import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Heart, Wind, Terminal, Code2, CheckCircle2 } from "lucide-react";
import assets from "../assets/asset";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

const SleekHero = () => {
  const { isAuthenticated } = useAuth();
  const [activeMoodScore, setActiveMoodScore] = useState(7);
  const [isBreathing, setIsBreathing] = useState(false);

  const moodDescriptions = {
    3: { label: "Code Fatigue & Burnout", desc: "Sprint crunch or debugging overload. Time to step away from screens.", color: "from-rose-500 to-pink-500", glow: "rgba(244, 63, 94, 0.25)" },
    5: { label: "Balanced Baseline", desc: "Steady, neutral mental bandwidth. Keep your tasks focused.", color: "from-amber-400 to-yellow-500", glow: "rgba(245, 158, 11, 0.25)" },
    7: { label: "Clear & Focused", desc: "Clean architecture, good momentum, calm nervous system.", color: "from-emerald-400 to-teal-500", glow: "rgba(16, 185, 129, 0.25)" },
    9: { label: "Flow State & Vitality", desc: "Deep creative immersion, problem-solving ease, energized joy.", color: "from-cyan-400 to-blue-500", glow: "rgba(14, 165, 233, 0.25)" },
  };

  const currentMood = moodDescriptions[activeMoodScore] || moodDescriptions[7];

  const toggleBreathPulse = () => {
    sounds.playCalmTone(440, 0.3);
    setIsBreathing(!isBreathing);
  };

  return (
    <section className="relative w-full h-[100vh] min-h-[100vh] max-h-[100vh] flex flex-col justify-center items-center overflow-hidden bg-gradient-to-b from-[#F0FDF4]/70 via-[#F8FAFC] to-[#FAFAFA] px-4 sm:px-8 select-none">
      {/* Background Calming Video Canvas from asset.js */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-20 scale-105 filter blur-[1px]"
        >
          <source src={assets.hero_video || assets.hero_video3} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-[#FAFAFA]" />
      </div>

      {/* Ambient Lighting Orbs */}
      <div
        className="aura-glow w-[520px] h-[520px] -top-24 -left-24 bg-emerald-400/20"
        style={{ backgroundColor: currentMood.glow }}
      />
      <div className="aura-glow w-[460px] h-[460px] -bottom-24 -right-24 bg-teal-400/15" />
      <div className="aura-glow w-[360px] h-[360px] top-1/3 left-1/2 -translate-x-1/2 bg-indigo-300/10" />

      {/* Main Hero Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-4 sm:space-y-5 pt-10 sm:pt-12">
        {/* Sleek Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-emerald-800 text-[11px] sm:text-xs font-bold shadow-xs backdrop-blur-md animate-in fade-in duration-500">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Calm Me · Developer Burnout & Mental Wellness Sanctuary by Sagrika</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1] font-display">
            Decode your burnout.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Reclaim your calm.
            </span>
          </h1>
          <p className="text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            A private, encrypted sanctuary built specifically for software developers to log daily emotional baseline, isolate reasons for burnout, and gently restore mental peace.
          </p>
        </div>

        {/* Live Interactive Calibration Widget */}
        <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-lg shadow-slate-200/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-emerald-600" /> Developer State Check
            </span>
            <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              {currentMood.label} ({activeMoodScore}/10)
            </span>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5 my-1.5">
            <input
              type="range"
              min="3"
              max="9"
              step="2"
              value={activeMoodScore}
              onChange={(e) => {
                sounds.playBlip(350 + parseInt(e.target.value) * 40);
                setActiveMoodScore(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] sm:text-[11px] font-semibold text-slate-400">
              <span>Code Burnout</span>
              <span>Balanced</span>
              <span>Flow State</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium italic my-1.5 line-clamp-1 sm:line-clamp-none">
            &ldquo;{currentMood.desc}&rdquo;
          </p>

          <button
            type="button"
            onClick={toggleBreathPulse}
            className="w-full mt-1.5 py-2 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wind className={`w-3.5 h-3.5 ${isBreathing ? "animate-spin text-emerald-600" : ""}`} />
            <span>{isBreathing ? "Breathing in sync... exhaling tension..." : "Tap for 10-second breath reset between PRs"}</span>
          </button>
        </div>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-sm pt-1">
          <Link
            to={isAuthenticated ? "/tracker" : "/login"}
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-lg shadow-slate-900/10 hover:bg-emerald-600 transition-all duration-200 cursor-pointer"
          >
            <span>Open Sanctuary</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#about"
            onClick={() => sounds.playClick()}
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-xs"
          >
            About Calm Me
          </a>
        </div>

        {/* Trust & Privacy Guarantee Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] sm:text-xs font-semibold text-slate-500 pt-1">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Designed & Developed by Sagrika
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Client-Encrypted & Private
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Zero Shaming
          </span>
        </div>
      </div>
    </section>
  );
};

export default SleekHero;
