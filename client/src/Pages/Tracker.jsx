import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TrackerSidebar from "../Components/TrackerSidebar";
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
import { PixelCloud, PixelPineTree, PixelGrassTuft } from "../Components/PixelCharacters";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import {
  PlusCircle,
  Lock,
  ShieldCheck,
  Sparkles,
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

const TAB_METADATA = {
  dashboard: {
    title: "Sanctuary Dashboard",
    category: "Workspace",
    description: "Your developer mental baseline, routine streaks, and recovery trajectory at a glance.",
  },
  journal: {
    title: "Engineering Journal",
    category: "Private Log",
    description: "Client-encrypted markdown notes to untangle complex sprint blockers and 2 AM thoughts.",
  },
  mood: {
    title: "Baseline Check-in",
    category: "Daily Telemetry",
    description: "Calibrate your cognitive comfort, energy reserves, and sprint tension.",
  },
  calendar: {
    title: "Mood & Stamina Matrix",
    category: "Longitudinal Insights",
    description: "30-day thermal calendar tracking code fatigue and recovery velocity.",
  },
  analytics: {
    title: "Burnout Correlation AI",
    category: "Analytical Engine",
    description: "Correlate uninterrupted IDE screen hours, sleep debt, and alert fatigue.",
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
    if (VALID_TABS.includes(raw)) return raw;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath);

  useEffect(() => {
    const tab = getTabFromPath();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    sounds.playClick();
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const currentTab = TAB_METADATA[activeTab] || TAB_METADATA.dashboard;

  return (
    <div className="min-h-screen bg-[#90D786] text-slate-900 flex font-sans selection:bg-[#0a1b10] selection:text-[#64DC4C] relative overflow-x-hidden">
      {/* Background Pixel Art Atmosphere (Meadow aesthetic matching Home page) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        {/* Subtle Pixel Clouds */}
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

      {/* 1. Spacious Vertical Navbar / Sidebar (Fixed on Desktop, Slide Drawer on Mobile) */}
      <TrackerSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {/* PIN Lock Overlay if locked */}
      {isLocked && <PinLockOverlay onUnlock={() => setIsLocked(false)} />}

      {/* 2. Main Content Canvas (Offset left on desktop by sidebar width: md:pl-72) */}
      <div className="flex-1 min-w-0 flex flex-col md:pl-72 pt-16 md:pt-0 relative z-10">
        {/* Retro Pixel Header Bar */}
        <header className="hidden md:flex w-full sticky top-0 z-20 bg-[#FCFAF4] border-b-2 border-[#0a1b10] shadow-[0_3px_0px_#0a1b10] px-8 lg:px-12 py-4 items-center justify-between">
          {/* Breadcrumbs & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#0a1b10]">
              <span>[ SANCTUARY</span>
              <span className="text-[#0a1b10]/40">//</span>
              <span>{currentTab.category.toUpperCase()} ]</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-[#0a1b10] font-display tracking-tight mt-0.5">
              {currentTab.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5">
              {currentTab.description}
            </p>
          </div>

          {/* Quick Action Toolbar (Chunky Retro Buttons) */}
          <div className="flex items-center gap-3 shrink-0 ml-4">
            {activeTab !== "mood" && (
              <button
                type="button"
                onClick={() => handleSelectTab("mood")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#64DC4C] hover:bg-[#52c93b] text-[#0a1b10] text-xs sm:text-sm font-black border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#0a1b10]" />
                <span>+ Log Check-in</span>
              </button>
            )}

            {activeTab !== "journal" && (
              <button
                type="button"
                onClick={() => handleSelectTab("journal")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0a1b10] border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs sm:text-sm font-black transition-all cursor-pointer"
              >
                <span>New Note</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setIsLocked(true);
              }}
              title="Instant Lock Sanctuary (PIN)"
              className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border-2 border-[#0a1b10] text-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Workspace Container (Spacious, Uncluttered, Pixel Art Cartridges) */}
        <main className="flex-1 w-full px-6 sm:px-8 lg:px-12 py-8 space-y-8 max-w-6xl">
          {/* =========================================================================
              ACTIVE WORKSPACE TOOL VIEW
             ========================================================================= */}

          {/* 1. DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Single Clean 3-Metric Cartridge Showcase */}
              <MoodDashboard refreshKey={refreshKey} />

              {/* Emotional Weather & Check-In Slider */}
              <MoodTracker onMoodLogged={triggerRefresh} />
            </div>
          )}

          {/* 2. JOURNAL */}
          {activeTab === "journal" && (
            <div className="space-y-8">
              <JournalCreator onEntryCreated={triggerRefresh} />
              <JournalHistory
                refreshKey={refreshKey}
                onEntryUpdated={triggerRefresh}
              />
            </div>
          )}

          {/* 3. MOOD TRACKER */}
          {activeTab === "mood" && (
            <div>
              <MoodTracker onMoodLogged={triggerRefresh} />
            </div>
          )}

          {/* 4. CALENDAR */}
          {activeTab === "calendar" && (
            <div>
              <MoodCalendar refreshKey={refreshKey} />
            </div>
          )}

          {/* 5. CORRELATION & AI */}
          {activeTab === "analytics" && (
            <div>
              <CorrelationAnalytics refreshKey={refreshKey} />
            </div>
          )}

          {/* 6. WELLNESS TOOLS */}
          {activeTab === "wellness" && (
            <div>
              <WellnessTools onJournalSaved={triggerRefresh} />
            </div>
          )}

          {/* 7. HABITS & GOALS */}
          {activeTab === "habits" && (
            <div>
              <HabitsAndGoals onRefreshNeeded={triggerRefresh} />
            </div>
          )}

          {/* 8. SETTINGS & PRIVACY */}
          {activeTab === "settings" && (
            <div>
              <SettingsAndPrivacy onLockActivated={() => setIsLocked(true)} />
            </div>
          )}
        </main>

        {/* Retro Pixel Status Footer */}
        <footer className="w-full bg-[#0a1b10] text-[#64DC4C] border-t-2 border-[#0a1b10] py-4 px-8 lg:px-12 text-xs font-mono mt-auto select-none">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2 font-black">
              <span>[ 🟢 CALM ME · 8-BIT MEADOW SANCTUARY ]</span>
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
