import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Flame, Heart, TrendingUp, Sparkles, Calendar, BookOpen, Code2 } from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";
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
      <div id="insights" className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-6 animate-pulse">
        <div className="h-44 bg-slate-100 rounded-3xl border border-slate-200/60" />
      </div>
    );
  }

  if (!stats) return null;

  const dominantMoodObj =
    (stats.mostFrequentMood && MOOD_OPTIONS.find((m) => m.name === stats.mostFrequentMood)) ||
    MOOD_OPTIONS[0] || { emoji: "🌿", desc: "Steady & balanced", name: "Steady" };

  return (
    <div id="insights" className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-6 scroll-mt-24 space-y-6">
      {/* 3 Sleek Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Streak */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-amber-200/80 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dev Routine Streak
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                {stats.currentStreak}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {stats.currentStreak === 1 ? "day active" : "days active"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {stats.currentStreak > 0
                ? "Consistent self-care builds resilient engineering focus."
                : "Check in today to claim your Day 1 streak!"}
            </p>
          </div>
        </div>

        {/* Card 2: Dominant Mood */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-emerald-200/80 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dominant State
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 shadow-xs">
              <Heart className="w-4 h-4 fill-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{dominantMoodObj?.emoji || "🌿"}</span>
              <div>
                <span className="text-2xl font-extrabold text-slate-900 block font-display leading-tight">
                  {stats.mostFrequentMood || "Steady"}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {dominantMoodObj?.desc || "Steady & balanced"}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Most frequently logged developer baseline.
            </p>
          </div>
        </div>

        {/* Card 3: Total Logs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-indigo-200/80 transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Reflections
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60 shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
                {stats.totalEntries}
              </span>
              <span className="text-xs font-bold text-slate-500">
                entries preserved
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Every day recorded deepens personal self-awareness and burnout prevention.
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Smooth Mini Bar */}
      {stats.recentWeekly && stats.recentWeekly.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" /> Past 7 Days Dev Trajectory
            </span>
            <span className="text-xs text-slate-400 font-medium">Daily Baseline</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {stats.recentWeekly.map((item, idx) => {
              const moodObj =
                (item.mood && MOOD_OPTIONS.find((m) => m.name === item.mood)) ||
                MOOD_OPTIONS[0] || { emoji: "🌿", name: item.mood };
              return (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex flex-col items-center gap-1 text-center hover:bg-slate-100/80 transition cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-slate-500">
                    {item.day}
                  </span>
                  <span className="text-xl my-0.5">{moodObj?.emoji || "🌿"}</span>
                  <span className="text-[11px] font-semibold text-slate-700 truncate max-w-full">
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
