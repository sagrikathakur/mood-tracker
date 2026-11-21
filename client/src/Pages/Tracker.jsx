import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TrackerSidebar from "../Components/TrackerSidebar";
import MoodDashboard from "../Components/MoodDashboard";
import MoodCalendar from "../Components/MoodCalendar";
import WellnessTools from "../Components/WellnessTools";
import HabitsAndGoals from "../Components/HabitsAndGoals";
import SettingsAndPrivacy from "../Components/SettingsAndPrivacy";
import SimpleJournalTodo from "../Components/SimpleJournalTodo";
import PinLockOverlay from "../Components/PinLockOverlay";
import { PixelCloud, PixelPineTree, PixelGrassTuft } from "../Components/PixelCharacters";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import { sounds } from "../utils/soundEffects";
import journalWallpaper from "../assets/journal_page_wallpaer.jpg";

const VALID_TABS = [
  "dashboard",
  "journal",
  "calendar",
  "wellness",
  "habits",
  "settings",
];

const TAB_METADATA = {
  dashboard: {
    title: "Sanctuary Dashboard",
    category: "Workspace",
    description: "Your developer mental baseline, routine streaks, and recovery trajectory at a glance.",
  },
  journal: {
    title: "Daily Journal & Tasks",
    category: "Botanical Workspace",
    description: "Botanical daily journal, priorities, to-dos, and structured reflections.",
  },
  calendar: {
    title: "Sanctuary Calendar",
    category: "Rhythm & Schedule",
    description: "Plan your daily schedule, deep focus blocks, and mindful breaks.",
  },
  wellness: {
    title: "Micro-Recovery Protocols",
    category: "Physiological Resets",
    description: "Evidence-based 60-second breathing pacers and sensory grounding for engineers.",
  },
  habits: {
    title: "Engineering Boundaries",
    category: "Habit Tracker",
    description: "Enforce healthy shutdown rituals and hydration breaks without toxic streak penalties.",
  },
  settings: {
    title: "Security & Privacy Vault",
    category: "System Preferences",
    description: "Manage 4-digit PIN lock, client-side encryption keys, and JSON sovereign data.",
  },
};

const Tracker = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshKey, triggerRefresh, isLocked, setIsLocked } = useWellness();

  const getTabFromPath = () => {
    const raw = location.pathname.replace("/", "").toLowerCase();
    if (raw === "tracker") return "dashboard";
    if (VALID_TABS.includes(raw)) {
      return raw;
    }
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    const tab = getTabFromPath();
    setActiveTab((prev) => (prev !== tab ? tab : prev));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    sounds.playClick();
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const currentTab = TAB_METADATA[activeTab] || TAB_METADATA.dashboard;

  return (
    <div
      className="min-h-screen text-slate-900 flex font-sans selection:bg-[#0a1b10] selection:text-[#64DC4C] relative overflow-x-hidden transition-all duration-300"
      style={
        activeTab === "journal"
          ? {
            backgroundImage: `url(${journalWallpaper})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }
          : activeTab === "dashboard"
          ? { backgroundColor: "#F4F7F5" }
          : { backgroundColor: "#90D786" }
      }
    >
      {activeTab !== "journal" && activeTab !== "dashboard" && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
          <div className="absolute top-10 right-20 opacity-30">
            <PixelCloud className="w-36 h-16" />
          </div>
          <div className="absolute top-48 left-80 opacity-20">
            <PixelCloud className="w-28 h-12" />
          </div>
          <div className="absolute bottom-20 right-10 opacity-25">
            <PixelPineTree className="w-14 h-24" />
          </div>
          <div className="absolute bottom-10 right-28 opacity-20">
            <PixelGrassTuft className="w-6 h-6 text-[#0a1b10]" />
          </div>
        </div>
      )}

      <TrackerSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {isLocked && <PinLockOverlay onUnlock={() => setIsLocked(false)} />}

      <div className="flex-1 min-w-0 flex flex-col md:pl-72 pt-16 md:pt-0 relative z-10">
        <header className={`hidden md:flex w-full sticky top-0 z-20 ${
          activeTab === "journal"
            ? "bg-white/80 backdrop-blur-md border-b border-white/60 shadow-2xs"
            : activeTab === "dashboard"
            ? "bg-[#F4F7F5]/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs"
            : "bg-[#FCFAF7] border-b border-slate-200/90 shadow-2xs"
          } px-8 lg:px-12 py-3.5 items-center justify-between`}>
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
              {currentTab.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
              {currentTab.description}
            </p>
          </div>
        </header>

        <main
          className={`flex-1 w-full py-6 sm:py-8 space-y-8 ${activeTab === "journal" || activeTab === "calendar"
            ? "px-3 sm:px-6 lg:px-8 max-w-none"
            : "px-6 sm:px-8 lg:px-12 max-w-6xl"
            }`}
        >
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              <MoodDashboard refreshKey={refreshKey} />
            </div>
          )}

          {activeTab === "journal" && (
            <SimpleJournalTodo onRefreshNeeded={triggerRefresh} />
          )}

          {activeTab === "calendar" && (
            <div>
              <MoodCalendar refreshKey={refreshKey} />
            </div>
          )}

          {activeTab === "wellness" && (
            <div>
              <WellnessTools onJournalSaved={triggerRefresh} />
            </div>
          )}

          {activeTab === "habits" && (
            <div>
              <HabitsAndGoals onRefreshNeeded={triggerRefresh} />
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <SettingsAndPrivacy onLockActivated={() => setIsLocked(true)} />
            </div>
          )}
        </main>

        <footer className="w-full bg-[#0a1b10] text-[#64DC4C] border-t-2 border-[#0a1b10] py-4 px-8 lg:px-12 text-xs font-mono mt-auto select-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64DC4C] inline-block shadow-xs" />
              <span>Calm Me · Meadow Sanctuary</span>
              <span className="text-white/40">·</span>
              <span className="text-white">Built with Care by Sagrika Thakur</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-[11px]">
              <span>AES-256 VAULT SEALED</span>
              <span>·</span>
              <span>ZERO TELEMETRY</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Tracker;
