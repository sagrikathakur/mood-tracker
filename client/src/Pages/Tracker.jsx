import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import JournalCreator from "../Components/JournalCreator";
import MoodDashboard from "../Components/MoodDashboard";
import JournalHistory from "../Components/JournalHistory";
import { useAuth } from "../context/AuthContext";
import { Sparkles } from "lucide-react";

const Tracker = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800">
      <Navbar />

      <main className="flex-1 w-full pt-28 pb-16">
        {/* Welcome Banner */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/20 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Personal Mental Sanctuary
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name || "Friend"}!
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-md">
                Reflect on your day, track your emotional patterns, and attach your memories in private.
              </p>
            </div>
            <a
              href="#tracker"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-xs sm:text-sm font-bold shadow-md hover:bg-slate-100 transition whitespace-nowrap"
            >
              Log Today's Mood
            </a>
          </div>
        </div>

        {/* 1. Mood Analytics Dashboard */}
        <MoodDashboard refreshKey={refreshKey} />

        {/* 2. Daily Mood & Journal Creator */}
        <JournalCreator onEntryCreated={handleRefresh} />

        {/* 3. Journal History Timeline & Search */}
        <JournalHistory
          refreshKey={refreshKey}
          onEntryUpdated={handleRefresh}
        />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8 px-4 text-center text-slate-500 text-xs sm:text-sm">
        <p className="font-semibold text-slate-700">🌿 Mood Tracker</p>
        <p className="mt-1 text-slate-400">
          Your private journal for mindfulness, reflection & emotional wellness.
        </p>
      </footer>
    </div>
  );
};

export default Tracker;
