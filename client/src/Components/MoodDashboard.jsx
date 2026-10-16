import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Flame, Heart, TrendingUp, Sparkles, Calendar, BookOpen } from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";

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
      <div id="insights" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-8 animate-pulse">
        <div className="h-44 bg-slate-200/60 rounded-3xl" />
      </div>
    );
  }

  if (!stats) return null;

  const dominantMoodObj =
    MOOD_OPTIONS.find((m) => m.name === stats.mostFrequentMood) || MOOD_OPTIONS[0];

  return (
    <div id="insights" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 scroll-mt-24">
      <div className="space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Streak */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Journaling Streak
              </span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {stats.currentStreak}
              </span>
              <span className="text-sm font-semibold text-white/80">
                {stats.currentStreak === 1 ? "Day In A Row" : "Days In A Row"}
              </span>
            </div>
            <p className="text-xs text-white/80 mt-2 font-medium">
              {stats.currentStreak > 0
                ? "Keep the momentum going! Great self-care habit."
                : "Log today's mood to start your streak!"}
            </p>
          </div>

          {/* Card 2: Dominant Mood */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-500/20">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Dominant Mood
              </span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{dominantMoodObj.emoji}</span>
              <div>
                <span className="text-2xl font-extrabold tracking-tight block">
                  {stats.mostFrequentMood || "No data yet"}
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {dominantMoodObj.desc}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/80 mt-3 font-medium">
              Most frequent emotional state in your journey.
            </p>
          </div>

          {/* Card 3: Total Memories */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                Total Memories
              </span>
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {stats.totalEntries}
              </span>
              <span className="text-sm font-semibold text-white/80">
                Moments Logged
              </span>
            </div>
            <p className="text-xs text-white/80 mt-2 font-medium">
              Every day recorded is a step toward mindful living.
            </p>
          </div>
        </div>

        {/* Weekly Mood Overview Bar */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Your Mood Over The Past 7 Days
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Notice daily emotional rhythm and patterns.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Last 7 Days
            </span>
          </div>

          {/* Days Row */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3 text-center">
            {Array.from({ length: 7 }).map((_, idx) => {
              const targetDate = new Date();
              targetDate.setDate(targetDate.getDate() - (6 - idx));
              const dateStr = targetDate.toISOString().slice(0, 10);
              const dayName = targetDate.toLocaleDateString("en-US", {
                weekday: "short",
              });

              const dayEntry = stats.recentWeekly?.find(
                (w) => w.date === dateStr
              );
              const moodObj = dayEntry
                ? MOOD_OPTIONS.find((m) => m.name === dayEntry.mood)
                : null;

              return (
                <div
                  key={dateStr}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    dayEntry
                      ? `${moodObj?.bg || "bg-indigo-50"} border-indigo-200 shadow-sm`
                      : "bg-slate-50/70 border-slate-100 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-500 mb-1">
                    {dayName}
                  </span>
                  <span className="text-2xl sm:text-3xl my-1">
                    {moodObj ? moodObj.emoji : "—"}
                  </span>
                  <span className="text-[11px] font-semibold truncate max-w-full">
                    {dayEntry ? dayEntry.mood : "Rest"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
