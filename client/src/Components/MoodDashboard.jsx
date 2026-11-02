import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Flame, Heart, TrendingUp, Sparkles, Calendar, BookOpen } from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";
import { PixelFlame, PixelHeart, PixelStar } from "./PixelIcons";
import { sounds } from "../utils/soundEffects";

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
      <div id="insights" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-6 animate-pulse">
        <div className="h-44 bg-slate-200/60 rounded-2xl border-2 border-[#18181B]" />
      </div>
    );
  }

  if (!stats) return null;

  const dominantMoodObj =
    MOOD_OPTIONS.find((m) => m.name === stats.mostFrequentMood) || MOOD_OPTIONS[0];

  return (
    <div id="insights" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24 space-y-6">
      {/* 3 Pixel Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Streak (Yellow Pixel Card) */}
        <div className="pixel-card bg-[#FEF9C3] p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181B] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-[#854D0E] uppercase tracking-wider">
              JOURNAL STREAK
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center">
              <PixelFlame className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-3xl sm:text-4xl font-black text-[#18181B]">
                {stats.currentStreak}
              </span>
              <span className="font-bold text-xs text-[#854D0E] font-display">
                {stats.currentStreak === 1 ? "day streak" : "days streak"}
              </span>
            </div>
            <p className="text-xs text-[#854D0E] font-bold mt-2">
              {stats.currentStreak > 0
                ? "Awesome consistency! Keep your sanctuary streak alive."
                : "Check in today to claim your Day 1 streak!"}
            </p>
          </div>
        </div>

        {/* Card 2: Dominant Mood (Green Pixel Card) */}
        <div className="pixel-card bg-[#DCFCE7] p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181B] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-[#166534] uppercase tracking-wider">
              DOMINANT MOOD
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center">
              <PixelHeart className="w-5 h-5" fill="#22C55E" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{dominantMoodObj.emoji}</span>
              <div>
                <span className="font-display text-2xl font-black text-[#18181B] block">
                  {stats.mostFrequentMood || "Steady"}
                </span>
                <span className="font-bold text-xs text-[#166534]">
                  {dominantMoodObj.desc}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#166534] font-bold mt-2">
              Most frequent emotional weather logged.
            </p>
          </div>
        </div>

        {/* Card 3: Total Memories (Purple Pixel Card) */}
        <div className="pixel-card bg-[#EDE9FE] p-6 flex flex-col justify-between hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181B] transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="font-pixel text-[10px] text-[#6B21A8] uppercase tracking-wider">
              TOTAL LOGS
            </span>
            <div className="w-9 h-9 rounded-xl bg-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center">
              <PixelStar className="w-5 h-5" fill="#C084FC" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-pixel text-3xl sm:text-4xl font-black text-[#18181B]">
                {stats.totalEntries}
              </span>
              <span className="font-bold text-xs text-[#6B21A8] font-display">
                reflections kept
              </span>
            </div>
            <p className="text-xs text-[#6B21A8] font-bold mt-2">
              Every day recorded builds your emotional insight.
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Mini Pixel Bar */}
      {stats.recentWeekly && stats.recentWeekly.length > 0 && (
        <div className="pixel-card bg-white p-5">
          <div className="flex items-center justify-between mb-3 border-b-2 border-[#18181B] pb-2">
            <span className="font-pixel text-xs text-[#18181B] flex items-center gap-2">
              <span>📅</span> 7-DAY EMOTIONAL QUEST
            </span>
            <span className="font-pixel text-[10px] text-slate-500">PAST WEEK</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {stats.recentWeekly.map((item, idx) => {
              const moodObj =
                MOOD_OPTIONS.find((m) => m.name === item.mood) || MOOD_OPTIONS[0];
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#FAF8F5] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex flex-col items-center gap-1 text-center hover:-translate-y-0.5 transition cursor-pointer"
                >
                  <span className="font-pixel text-[9px] text-[#18181B]">
                    {item.day}
                  </span>
                  <span className="text-lg">{moodObj.emoji}</span>
                  <span className="font-bold text-[10px] text-slate-700 truncate max-w-full">
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
