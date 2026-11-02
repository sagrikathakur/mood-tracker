import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Flame, Heart, TrendingUp, Sparkles, Calendar, BookOpen } from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";
import { sounds } from "../utils/soundEffects";
import { PixelFrog, PixelOwl, PixelFox } from "./PixelCharacters";

const MoodDashboard = ({ refreshKey }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/api/journal/analytics");
        if (res.data?.analytics) {
          setStats(res.data.analytics);
        }
      } catch (err) {
        console.warn("Could not load mood analytics:", err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshKey]);

  if (loading) {
    return (
      <div id="insights" className="w-full space-y-6 animate-pulse">
        <div className="h-44 bg-white/60 rounded-2xl border-2 border-[#0a1b10]/20 shadow-[4px_4px_0px_0px_#0a1b10]/20" />
      </div>
    );
  }

  const currentStats = stats || {
    currentStreak: 0,
    mostFrequentMood: "Steady",
    totalEntries: 0,
    recentWeekly: [],
  };

  const dominantMoodObj =
    (currentStats.mostFrequentMood &&
      MOOD_OPTIONS.find((m) => m.name === currentStats.mostFrequentMood)) ||
    MOOD_OPTIONS[0] || {
      emoji: "🌿",
      desc: "Steady & balanced",
      name: "Steady",
    };

  return (
    <div id="insights" className="w-full space-y-6 select-none">
      {/* 3 Retro 8-Bit Pixel Cartridge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Dev Routine Streak */}
        <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-7 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10] hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10]">
              [ STAT 01 // STREAK ]
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-700" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-950 font-display">
                  {currentStats.currentStreak}
                </span>
                <span className="text-sm font-black text-slate-700 font-mono">
                  {currentStats.currentStreak === 1 ? "DAY ACTIVE" : "DAYS ACTIVE"}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 font-bold leading-relaxed">
                {currentStats.currentStreak > 0
                  ? "Consistent self-care builds resilient engineering focus."
                  : "Check in today to claim your Day 1 streak!"}
              </p>
            </div>

            {/* Companion Sprite */}
            <div className="shrink-0 pl-1" title="Hoppy the Streak Frog">
              <PixelFrog className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Card 2: Dominant Emotional Baseline */}
        <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-7 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10] hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10]">
              [ STAT 02 // DOMINANT ]
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-950 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex items-center justify-center">
              <Heart className="w-5 h-5 fill-emerald-500 text-emerald-800" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl">{dominantMoodObj?.emoji || "🌿"}</span>
                <div>
                  <span className="text-2xl sm:text-3xl font-black text-slate-950 block font-display leading-tight">
                    {currentStats.mostFrequentMood || "Steady"}
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-600">
                    {dominantMoodObj?.desc || "Steady & balanced"}
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 font-bold leading-relaxed">
                Most frequently logged developer baseline.
              </p>
            </div>

            {/* Companion Sprite */}
            <div className="shrink-0 pl-1" title="Sage the Wisdom Owl">
              <PixelOwl className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Card 3: Total Reflections Preserved */}
        <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-7 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10] hover:-translate-y-1 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10]">
              [ STAT 03 // ARCHIVE ]
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-950 border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-900" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-slate-950 font-display">
                  {currentStats.totalEntries}
                </span>
                <span className="text-sm font-black text-slate-700 font-mono">
                  ENTRIES
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 mt-2 font-bold leading-relaxed">
                Every reflection recorded deepens personal self-awareness & burnout defense.
              </p>
            </div>

            {/* Companion Sprite */}
            <div className="shrink-0 pl-1" title="Foxy the Mindful Fox">
              <PixelFox className="w-12 h-12" />
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day 8-Bit Cartridge Deck */}
      {currentStats.recentWeekly && currentStats.recentWeekly.length > 0 && (
        <div className="bg-[#FCFAF4] rounded-2xl p-6 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10]">
          <div className="flex items-center justify-between mb-4 border-b-2 border-[#0a1b10]/15 pb-3">
            <span className="text-xs font-mono font-black uppercase tracking-wider text-[#0a1b10] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-800" />
              [ TRAJECTORY // PAST 7 DAYS DEV BASELINE ]
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-600 bg-white border border-[#0a1b10] px-2 py-0.5 rounded-md">
              7-DAY TAPE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
            {currentStats.recentWeekly.map((item, idx) => {
              const moodObj =
                (item.mood && MOOD_OPTIONS.find((m) => m.name === item.mood)) ||
                MOOD_OPTIONS[0] || { emoji: "🌿", name: item.mood };
              return (
                <div
                  key={idx}
                  onClick={() => sounds.playClick()}
                  className="p-3.5 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] flex flex-col items-center gap-1 text-center hover:bg-[#EBF7E9] hover:shadow-[3px_3px_0px_#0a1b10] hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <span className="text-[11px] font-mono font-black text-slate-600 uppercase">
                    {item.day}
                  </span>
                  <span className="text-2xl my-1">{moodObj?.emoji || "🌿"}</span>
                  <span className="text-xs font-extrabold text-[#0a1b10] truncate max-w-full">
                    {item.mood}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodDashboard;
