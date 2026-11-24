import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TrackerSidebar from "../Components/TrackerSidebar";
import MoodDashboard from "../Components/MoodDashboard";
import WellnessTools from "../Components/WellnessTools";
import HabitsAndGoals from "../Components/HabitsAndGoals";
import SimpleJournalTodo from "../Components/SimpleJournalTodo";
import PinLockOverlay from "../Components/PinLockOverlay";
import { useAuth } from "../context/AuthContext";
import { useWellness } from "../context/WellnessContext";
import { sounds } from "../utils/soundEffects";
import journalWallpaper from "../assets/journal_page_wallpaer.jpg";
import wellnessWallpaper from "../assets/chat-background.jpg";
import habitsWallpaper from "../assets/calender-bg.jpg";

const VALID_TABS = [
  "dashboard",
  "journal",
  "wellness",
  "habits",
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
  wellness: {
    title: "Micro-Recovery Protocols",
    category: "Mindfulness Resets",
    description: "Mindful meditation timer and gratitude reflections for engineers.",
  },
  habits: {
    title: "Engineering Boundaries",
    category: "Habit Tracker",
    description: "Enforce healthy shutdown rituals and hydration breaks without toxic streak penalties.",
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

  const getTabStyle = () => {
    if (activeTab === "journal") {
      return {
        backgroundImage: `url(${journalWallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    }
    if (activeTab === "wellness") {
      return {
        backgroundImage: `url(${wellnessWallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    }
    if (activeTab === "habits") {
      return {
        backgroundImage: `url(${habitsWallpaper})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      };
    }
    return { backgroundColor: "#FBF9F5" };
  };

  const isBgActive =
    activeTab === "journal" || activeTab === "wellness" || activeTab === "habits";

  return (
    <div
      className="min-h-screen text-slate-900 flex font-sans selection:bg-[#0a1b10] selection:text-[#64DC4C] relative overflow-x-hidden transition-all duration-300"
      style={getTabStyle()}
    >
      <TrackerSidebar activeTab={activeTab} onSelectTab={handleSelectTab} />

      {isLocked && <PinLockOverlay onUnlock={() => setIsLocked(false)} />}

      <div className="flex-1 min-w-0 flex flex-col md:pl-64 pt-16 md:pt-0 relative z-10">
        <header className={`hidden md:flex w-full sticky top-0 z-20 ${
          isBgActive
            ? "bg-white/80 backdrop-blur-md border-b border-white/60 shadow-2xs"
            : "bg-[#FBF9F5]/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs"
          } px-8 lg:px-12 py-3.5 items-center justify-between`}>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-stone-900 font-display tracking-tight">
              {currentTab.title}
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {currentTab.description}
            </p>
          </div>
        </header>

        <main
          className={`flex-1 w-full py-6 sm:py-8 space-y-8 ${activeTab === "journal"
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
        </main>
      </div>
    </div>
  );
};

export default Tracker;
