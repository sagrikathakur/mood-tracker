import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import KizuCompanion from "../Components/KizuCompanion";
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
import {
  LayoutDashboard,
  BookOpen,
  Smile,
  Calendar as CalendarIcon,
  TrendingUp,
  Wind,
  Target,
  Settings,
  Sparkles,
  Lock,
  HeartHandshake,
} from "lucide-react";
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

  const getTabFromPath = () => {
    const raw = location.pathname.replace("/", "").toLowerCase();
    if (VALID_TABS.includes(raw)) return raw;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const tab = getTabFromPath();
    setActiveTab(tab);
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    sounds.playClick();
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "journal", label: "My Journal", icon: BookOpen },
    { id: "mood", label: "Mood Tracker", icon: Smile },
    { id: "calendar", label: "Mood Calendar", icon: CalendarIcon },
    { id: "analytics", label: "Correlation & AI", icon: TrendingUp },
    { id: "wellness", label: "Wellness Tools", icon: Wind },
    { id: "habits", label: "Habits & Goals", icon: Target },
    { id: "settings", label: "Settings & Privacy", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] flex flex-col font-sans selection:bg-[#DCFCE7] selection:text-[#18181B]">
      <Navbar />

      {/* PIN Lock Overlay if locked */}
      {isLocked && <PinLockOverlay onUnlock={() => setIsLocked(false)} />}

      <main className="flex-1 w-full pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 space-y-4">
          {/* Sanctuary Pixel Companion Card */}
          <KizuCompanion userName={user?.name || "Player 1"} />

          {/* Pixel Tab Navigation Bar */}
          <div className="flex items-center gap-2 overflow-x-auto p-2 bg-white border-[2.5px] border-[#18181B] rounded-2xl shadow-[4px_4px_0px_#18181B] scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex-1 min-w-[125px] flex items-center justify-center gap-2 py-3 px-3.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer whitespace-nowrap ${isActive
                      ? "bg-[#FACC15] text-[#18181B] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] -translate-y-0.5 font-display"
                      : "text-[#52525B] hover:text-[#18181B] hover:bg-[#F4F4F5] font-display"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENTS */}

        {/* 1. DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="animate-in fade-in duration-200 space-y-6">
            <MoodDashboard refreshKey={refreshKey} />
            <MoodTracker onMoodLogged={handleRefresh} />
            <JournalHistory
              refreshKey={refreshKey}
              onEntryUpdated={handleRefresh}
            />
          </div>
        )}

        {/* 2. JOURNAL */}
        {activeTab === "journal" && (
          <div className="animate-in fade-in duration-200">
            <JournalCreator onEntryCreated={handleRefresh} />
            <JournalHistory
              refreshKey={refreshKey}
              onEntryUpdated={handleRefresh}
            />
          </div>
        )}

        {/* 3. MOOD TRACKER */}
        {activeTab === "mood" && (
          <div className="animate-in fade-in duration-200">
            <MoodTracker onMoodLogged={handleRefresh} />
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
            <WellnessTools onJournalSaved={handleRefresh} />
          </div>
        )}

        {/* 7. HABITS & GOALS */}
        {activeTab === "habits" && (
          <div className="animate-in fade-in duration-200">
            <HabitsAndGoals onRefreshNeeded={handleRefresh} />
          </div>
        )}

        {/* 8. SETTINGS & PRIVACY */}
        {activeTab === "settings" && (
          <div className="animate-in fade-in duration-200">
            <SettingsAndPrivacy onLockActivated={() => setIsLocked(true)} />
          </div>
        )}
      </main>

      {/* Retro Pixel Footer */}
      <footer className="w-full bg-white border-t-[2.5px] border-[#18181B] py-10 px-4 text-center text-xs">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-2">
          <div className="font-pixel text-xs text-[#18181B] flex items-center gap-2">
            <span>🌿 MINDSPACE</span>
            <span>·</span>
            <span>8-BIT RETRO SANCTUARY</span>
          </div>
          <p className="text-[#71717A] text-[11px] font-bold max-w-md">
            Handcrafted with Neo-Brutalist Pixel UI & Web Audio chimes. Encrypted & entirely private.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Tracker;
