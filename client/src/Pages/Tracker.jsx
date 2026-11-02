import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import JournalCreator from "../Components/JournalCreator";
import MoodDashboard from "../Components/MoodDashboard";
import JournalHistory from "../Components/JournalHistory";
import MoodTracker from "../Components/MoodTracker";
import MoodCalendar from "../Components/MoodCalendar";
import CorrelationAnalytics from "../Components/CorrelationAnalytics";
import WellnessTools from "../Components/WellnessTools";
import HabitsAndGoals from "../Components/HabitsAndGoals";
import SettingsAndPrivacy from "../Components/SettingsAndPrivacy";
import PinLockOverlay from "../Components/PinLockOverlay";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import { Code2 } from "lucide-react";
import { sounds } from "../utils/soundEffects";

const VALID_TABS = [
  "dashboard",
  "journal",
  "mood",
  "calendar",
  "analytics",
  "wellness",
  "habits",
  "settings",
];

const Tracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshKey, triggerRefresh, isLocked, setIsLocked } = useWellness();

  const getTabFromPath = () => {
    const raw = location.pathname.replace("/", "").toLowerCase();
    if (VALID_TABS.includes(raw)) return raw;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    const tab = getTabFromPath();
    setActiveTab(tab);
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    sounds.playClick();
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Global Full-Width Navbar (The ONLY navbar in the application) */}
      <Navbar />

      {/* PIN Lock Overlay if locked */}
      {isLocked && <PinLockOverlay onUnlock={() => setIsLocked(false)} />}

      <main className="flex-1 w-full pt-20 sm:pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 space-y-5">
          {/* Sleek Developer Greeting & Sanctuary Status Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <Code2 className="w-3.5 h-3.5" />
                <span>Calm Me · Developer Sanctuary</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
                Welcome back, {user?.name || "Sagrika"}! 🌿
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Honor your mental and cognitive bandwidth today. Step away from screen strain and calibrate your baseline.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <button
                type="button"
                onClick={() => handleSelectTab("mood")}
                className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs hover:bg-emerald-600 transition shadow-sm cursor-pointer"
              >
                Log Dev Baseline
              </button>
            </div>
          </div>
        </div>

        {/* TAB CONTENTS (No duplicate second navbar bar) */}

        {/* 1. DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in duration-200 space-y-6">
            <MoodDashboard refreshKey={refreshKey} />
            <MoodTracker onMoodLogged={triggerRefresh} />
            <JournalHistory
              refreshKey={refreshKey}
              onEntryUpdated={triggerRefresh}
            />
          </div>
        )}

        {/* 2. JOURNAL */}
        {activeTab === "journal" && (
          <div className="animate-in fade-in duration-200">
            <JournalCreator onEntryCreated={triggerRefresh} />
            <JournalHistory
              refreshKey={refreshKey}
              onEntryUpdated={triggerRefresh}
            />
          </div>
        )}

        {/* 3. MOOD TRACKER */}
        {activeTab === "mood" && (
          <div className="animate-in fade-in duration-200">
            <MoodTracker onMoodLogged={triggerRefresh} />
          </div>
        )}

        {/* 4. CALENDAR */}
        {activeTab === "calendar" && (
          <div className="animate-in fade-in duration-200">
            <MoodCalendar refreshKey={refreshKey} />
          </div>
        )}

        {/* 5. CORRELATION & AI */}
        {activeTab === "analytics" && (
          <div className="animate-in fade-in duration-200">
            <CorrelationAnalytics refreshKey={refreshKey} />
          </div>
        )}

        {/* 6. WELLNESS TOOLS */}
        {activeTab === "wellness" && (
          <div className="animate-in fade-in duration-200">
            <WellnessTools onJournalSaved={triggerRefresh} />
          </div>
        )}

        {/* 7. HABITS & GOALS */}
        {activeTab === "habits" && (
          <div className="animate-in fade-in duration-200">
            <HabitsAndGoals onRefreshNeeded={triggerRefresh} />
          </div>
        )}

        {/* 8. SETTINGS & PRIVACY */}
        {activeTab === "settings" && (
          <div className="animate-in fade-in duration-200">
            <SettingsAndPrivacy onLockActivated={() => setIsLocked(true)} />
          </div>
        )}
      </main>

      {/* Sleek Modern Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-1.5">
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            <span>🌿 Calm Me</span>
            <span>·</span>
            <span>Developer Burnout & Wellness Sanctuary by Sagrika</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            100% Client-Encrypted data. No tracking cookies. Built by developers, for developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Tracker;
