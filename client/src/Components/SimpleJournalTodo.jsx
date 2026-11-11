import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  BookOpen,
  CalendarDays,
  Save,
  Smile,
  Meh,
  Frown,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import MoodCalendar from "./MoodCalendar";

// =========================================================================
// BOTANICAL SVG ILLUSTRATIONS (Hand-crafted, elegant forest green aesthetic)
// =========================================================================

// Monstera leaf vector for planner corners & watermarks
const MonsteraLeafSVG = ({ className = "w-20 h-20 text-[#2d6a4f]" }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    className={className}
    aria-hidden="true"
  >
    <path d="M50 95 C50 65 52 35 54 10" strokeLinecap="round" />
    <path
      d="M54 22 C68 18 80 26 84 40 C76 42 66 38 54 44"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M54 44 C72 44 86 54 86 68 C78 66 70 60 54 64"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M54 64 C70 68 80 78 74 88 C66 84 60 76 52 74"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M54 22 C40 16 26 24 22 36 C30 40 40 36 54 40"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M54 40 C36 40 22 48 20 62 C30 62 38 56 52 60"
      fill="currentColor"
      fillOpacity="0.08"
    />
    <path
      d="M52 60 C36 66 26 76 32 86 C40 80 46 74 52 70"
      fill="currentColor"
      fillOpacity="0.08"
    />
  </svg>
);

// Botanical Branch illustration for Weekly Log left side
const BotanicalBranchSVG = ({ className = "w-24 h-24 text-[#2d6a4f]" }) => (
  <svg
    viewBox="0 0 120 120"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    className={className}
    aria-hidden="true"
  >
    <path d="M25 105 C48 85 72 55 95 18" strokeLinecap="round" />
    <path
      d="M42 82 C30 80 24 70 32 62 C40 68 46 76 42 82 Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path
      d="M55 70 C68 66 74 56 68 48 C60 54 56 62 55 70 Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path
      d="M68 55 C54 52 50 40 58 34 C66 40 70 48 68 55 Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path
      d="M80 40 C92 36 96 26 88 18 C80 24 78 32 80 40 Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path
      d="M95 18 C92 10 82 8 80 16 C84 22 90 22 95 18 Z"
      fill="currentColor"
      fillOpacity="0.15"
    />
  </svg>
);

// Potted succulent plant accent for bottom corners
const PottedPlantSVG = ({ className = "w-12 h-16 text-[#2d6a4f]" }) => (
  <svg
    viewBox="0 0 60 80"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.4"
    className={className}
    aria-hidden="true"
  >
    {/* Leaves */}
    <path
      d="M30 45 C20 30 18 15 28 8 C36 18 34 32 30 45 Z"
      fill="currentColor"
      fillOpacity="0.14"
    />
    <path
      d="M30 45 C40 30 46 16 38 10 C30 20 31 32 30 45 Z"
      fill="currentColor"
      fillOpacity="0.14"
    />
    <path
      d="M28 45 C15 38 8 28 15 22 C24 26 27 36 28 45 Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    <path
      d="M32 45 C45 38 52 28 45 22 C36 26 33 36 32 45 Z"
      fill="currentColor"
      fillOpacity="0.12"
    />
    {/* Pot */}
    <path d="M18 48 L42 48 L38 72 L22 72 Z" fill="#e8f5e9" />
    <path d="M15 45 L45 45 L43 49 L17 49 Z" fill="#c8e6c9" />
  </svg>
);

// Weekly Mood Options (Clean, outline icons - strictly NO emojis)
const WEEKLY_MOODS = [
  { id: "Happy", label: "Happy", icon: Smile },
  { id: "Neutral", label: "Neutral", icon: Meh },
  { id: "Stressed", label: "Stressed", icon: Frown },
  { id: "Tired", label: "Tired", icon: Clock },
  { id: "Focused", label: "Focused", icon: Target },
];

// Helper: Calculate Monday of a given date's week
const getMonday = (d = new Date()) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export function SimpleJournalTodo({ onRefreshNeeded }) {
  // Navigation & View state
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [activeView, setActiveView] = useState("spread"); // "spread" | "calendar"
  const [isSaving, setIsSaving] = useState(false);

  const weekKey = useMemo(() => {
    return currentMonday.toISOString().slice(0, 10);
  }, [currentMonday]);

  const formattedWeekRange = useMemo(() => {
    const sunday = new Date(currentMonday);
    sunday.setDate(currentMonday.getDate() + 6);
    const mOpts = { month: "short", day: "numeric" };
    const sOpts = { month: "short", day: "numeric", year: "numeric" };
    return `${currentMonday.toLocaleDateString(undefined, mOpts)} - ${sunday.toLocaleDateString(undefined, sOpts)}`;
  }, [currentMonday]);

  // =========================================================================
  // 1. WEEKLY LOG & REFLECTION STATE (Left Page + Right Page)
  // =========================================================================
  const defaultWeeklyData = {
    wins: "",
    challenges: "",
    mood: "Happy",
    lessonsLearned: "",
    nextWeekPriorities: ["", "", ""],
    financials: {
      income: "",
      expenses: "",
      notes: "",
    },
    top3Priorities: ["", "", ""],
    reflection: {
      whatWentWell: "",
      whatCouldBeImproved: "",
      goalsNextWeek: "",
    },
  };

  const [logData, setLogData] = useState(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_weekly_log_${weekKey}`);
      if (saved) {
        return { ...defaultWeeklyData, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultWeeklyData;
  });

  // Re-load weekly data when week key changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_weekly_log_${weekKey}`);
      if (saved) {
        setLogData({ ...defaultWeeklyData, ...JSON.parse(saved) });
      } else {
        setLogData(defaultWeeklyData);
      }
    } catch {
      setLogData(defaultWeeklyData);
    }
  }, [weekKey]);

  // Save logData changes to localStorage
  const updateLogField = (field, value) => {
    setLogData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(`sanctuary_weekly_log_${weekKey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updateNestedField = (parent, field, value) => {
    setLogData((prev) => {
      const updated = {
        ...prev,
        [parent]: {
          ...(prev[parent] || {}),
          [field]: value,
        },
      };
      try {
        localStorage.setItem(`sanctuary_weekly_log_${weekKey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updatePriorityArray = (parentKey, index, text) => {
    setLogData((prev) => {
      const arr = [...(prev[parentKey] || ["", "", ""])];
      arr[index] = text;
      const updated = { ...prev, [parentKey]: arr };
      try {
        localStorage.setItem(`sanctuary_weekly_log_${weekKey}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // =========================================================================
  // 2. TO-DO TASKS STATE (Integrated with sanctuary_todos)
  // =========================================================================
  const [todos, setTodos] = useState(() => {
    try {
      const saved = localStorage.getItem("sanctuary_todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.filter((t) => t.id !== 1 && t.id !== 2 && t.id !== 3)
          : [];
      }
    } catch {}
    return [];
  });
  const [newTodoTitle, setNewTodoTitle] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("sanctuary_todos", JSON.stringify(todos));
    } catch (e) {}
  }, [todos]);

  const handleAddTodo = (e) => {
    if (e) e.preventDefault();
    const trimmed = newTodoTitle.trim();
    if (!trimmed) return;

    sounds.playClick();
    const newTask = {
      id: Date.now(),
      title: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, newTask]);
    setNewTodoTitle("");
    toast.success("Task added to your list!");
  };

  const handleToggleTodo = (id) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextState = !t.completed;
          if (nextState) sounds.playSuccess();
          else sounds.playPop(340);
          return { ...t, completed: nextState };
        }
        return t;
      })
    );
  };

  const handleDeleteTodo = (id) => {
    sounds.playClick();
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  // =========================================================================
  // 3. APPOINTMENTS & EVENTS STATE (Integrated with calendar events)
  // =========================================================================
  const [allEvents, setAllEvents] = useState(() => {
    try {
      const saved = localStorage.getItem("sanctuary_calendar_events");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newEventTitle, setNewEventTitle] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("sanctuary_calendar_events", JSON.stringify(allEvents));
    } catch (e) {}
  }, [allEvents]);

  // Filter events for the currently viewed week
  const weekDatesList = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(currentMonday);
      d.setDate(currentMonday.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [currentMonday]);

  const weekEvents = useMemo(() => {
    return allEvents.filter((e) => weekDatesList.includes(e.date));
  }, [allEvents, weekDatesList]);

  const handleAddQuickEvent = (e) => {
    if (e) e.preventDefault();
    const trimmed = newEventTitle.trim();
    if (!trimmed) return;

    sounds.playSuccess();
    const newEvt = {
      id: Date.now(),
      title: trimmed,
      date: currentMonday.toISOString().slice(0, 10),
      hour: 10,
      tagColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      tagLabel: "Meeting",
      completed: false,
    };
    setAllEvents((prev) => [...prev, newEvt]);
    setNewEventTitle("");
    toast.success("Event added to this week!");
  };

  const handleDeleteEvent = (id) => {
    sounds.playClick();
    setAllEvents((prev) => prev.filter((e) => e.id !== id));
  };

  // =========================================================================
  // 4. WEEK NAVIGATION & SAVE
  // =========================================================================
  const handlePrevWeek = () => {
    sounds.playClick();
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  };

  const handleNextWeek = () => {
    sounds.playClick();
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d);
  };

  const handleThisWeek = () => {
    sounds.playClick();
    setCurrentMonday(getMonday(new Date()));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    sounds.playClick();

    try {
      // Local backup save
      localStorage.setItem(`sanctuary_weekly_log_${weekKey}`, JSON.stringify(logData));

      // Synchronize with API
      const reflectionSummary = [
        `Wins: ${logData.wins || "None listed"}`,
        `Challenges: ${logData.challenges || "None listed"}`,
        `Lessons Learned: ${logData.lessonsLearned || "None listed"}`,
        `What went well: ${logData.reflection?.whatWentWell || ""}`,
        `Could be improved: ${logData.reflection?.whatCouldBeImproved || ""}`,
      ].join("\n\n");

      await api.post("/api/journal", {
        mood: logData.mood || "Calm",
        content: reflectionSummary,
        entryDate: currentMonday.toISOString().slice(0, 10),
        tags: ["WeeklyPlanner"],
        isPrivate: true,
      });

      sounds.playSuccess();
      toast.success("Weekly Journal saved to your vault!");
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (e) {
      sounds.playSuccess();
      toast.success("Weekly Journal saved locally!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 select-none animate-in fade-in duration-200">
      {/* =========================================================================
          TOP TOOLBAR: Week Navigator + View Switcher + Save Action
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FAF8F2] border-2 border-[#2d6a4f]/30 rounded-2xl p-3 sm:p-4 shadow-sm">
        {/* Week Navigator */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="p-2 rounded-xl text-[#1b4332] hover:bg-[#e8f5e9] border border-[#2d6a4f]/25 transition cursor-pointer"
            title="Previous Week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleThisWeek}
            className="px-3 py-1.5 rounded-xl bg-white text-[#1b4332] font-serif italic font-bold text-xs border border-[#2d6a4f]/30 hover:bg-[#e8f5e9] transition cursor-pointer shadow-2xs"
          >
            This Week
          </button>

          <span className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332] px-2 text-center min-w-[170px]">
            Week of {formattedWeekRange}
          </span>

          <button
            type="button"
            onClick={handleNextWeek}
            className="p-2 rounded-xl text-[#1b4332] hover:bg-[#e8f5e9] border border-[#2d6a4f]/25 transition cursor-pointer"
            title="Next Week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* View Switcher & Save Button */}
        <div className="flex items-center gap-2.5 justify-end">
          <div className="inline-flex items-center p-1 bg-white border border-[#2d6a4f]/30 rounded-xl text-xs font-serif italic font-semibold">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveView("spread");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === "spread"
                  ? "bg-[#2d6a4f] text-white shadow-2xs"
                  : "text-[#2d6a4f] hover:text-[#1b4332]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Weekly Journal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveView("calendar");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeView === "calendar"
                  ? "bg-[#2d6a4f] text-white shadow-2xs"
                  : "text-[#2d6a4f] hover:text-[#1b4332]"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Full Calendar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-serif italic font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm active:translate-y-0.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Journal"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CONDITIONAL VIEW: Full Calendar vs Botanical Weekly Book Spread
         ========================================================================= */}
      {activeView === "calendar" ? (
        <MoodCalendar
          onWriteForDate={() => {
            setActiveView("spread");
            toast.success("Switched to Weekly Journal spread!");
          }}
        />
      ) : (
        /* =========================================================================
            THE BOTANICAL OPEN BOOK SPREAD (Full Width Canvas)
           ========================================================================= */
        <div className="w-full relative bg-[#f0f6f2] p-2.5 sm:p-5 lg:p-6 rounded-3xl border-2 border-[#2d6a4f]/25 shadow-xl">
          {/* Open Book Container */}
          <div className="w-full relative bg-[#FCFAF5] rounded-2xl border-2 border-[#2d6a4f]/35 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x-2 divide-[#2d6a4f]/20">
            {/* Center Book Crease / Spine shadow */}
            <div
              className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 pointer-events-none z-20 bg-gradient-to-r from-black/[0.04] via-transparent to-black/[0.04]"
              aria-hidden="true"
            />

            {/* =====================================================================
                LEFT PAGE: WEEKLY LOG
               ===================================================================== */}
            <div className="p-5 sm:p-7 lg:p-8 xl:p-10 space-y-6 bg-gradient-to-br from-white to-[#FAF7F0] relative">
              {/* Header */}
              <div className="text-center pt-1 pb-1">
                <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-[#1b4332] tracking-tight">
                  Weekly Log
                </h2>
              </div>

              {/* 1. Top Row: Wins This Week & Challenges & Solutions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Wins This Week */}
                <div className="bg-[#eaf5ed] border-2 border-[#2d6a4f]/35 rounded-2xl p-4 shadow-xs flex flex-col min-h-[140px] relative transition-colors focus-within:border-[#1b4332]">
                  <h3 className="font-serif italic font-bold text-center text-xs sm:text-sm text-[#1b4332] pb-1.5">
                    Wins This Week
                  </h3>
                  <textarea
                    rows={4}
                    value={logData.wins}
                    onChange={(e) => updateLogField("wins", e.target.value)}
                    placeholder="Milestones reached, bugs solved, victories..."
                    className="w-full flex-1 bg-transparent border-0 resize-none text-xs leading-relaxed text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none"
                  />
                </div>

                {/* Challenges & Solutions */}
                <div className="bg-[#eaf5ed] border-2 border-[#2d6a4f]/35 rounded-2xl p-4 shadow-xs flex flex-col min-h-[140px] relative transition-colors focus-within:border-[#1b4332]">
                  <h3 className="font-serif italic font-bold text-center text-xs sm:text-sm text-[#1b4332] pb-1.5">
                    Challenges &amp; Solutions
                  </h3>
                  <textarea
                    rows={4}
                    value={logData.challenges}
                    onChange={(e) => updateLogField("challenges", e.target.value)}
                    placeholder="Blockers navigated, workarounds, lessons..."
                    className="w-full flex-1 bg-transparent border-0 resize-none text-xs leading-relaxed text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none"
                  />
                </div>
              </div>

              {/* 2. Middle Row: Botanical Illustration + Mood Tracker + Lessons Learned */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-2">
                {/* Left: Botanical Branch */}
                <div className="sm:col-span-4 flex items-center justify-center py-1">
                  <BotanicalBranchSVG className="w-24 h-24 sm:w-28 sm:h-28 text-[#2d6a4f]" />
                </div>

                {/* Right: Mood & Lessons */}
                <div className="sm:col-span-8 space-y-4">
                  {/* Mood Tracker */}
                  <div className="space-y-1.5">
                    <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                      Mood Tracker
                    </h4>
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      {WEEKLY_MOODS.map((m) => {
                        const Icon = m.icon;
                        const isSelected = logData.mood === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              sounds.playPop(320);
                              updateLogField("mood", m.id);
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-serif italic font-semibold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#2d6a4f] text-white border-[#1b4332] shadow-xs"
                                : "border-[#2d6a4f]/30 bg-white/90 text-[#2d6a4f] hover:border-[#2d6a4f]"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lessons Learned */}
                  <div className="space-y-1">
                    <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                      Lessons Learned
                    </h4>
                    <textarea
                      rows={3}
                      value={logData.lessonsLearned}
                      onChange={(e) => updateLogField("lessonsLearned", e.target.value)}
                      placeholder="Insights to take forward..."
                      className="w-full bg-transparent border-b border-dashed border-[#2d6a4f]/40 py-1 text-xs leading-relaxed text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none focus:border-[#2d6a4f] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Bottom Row: Next Week's Priorities + Income & Expenses Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-3 border-t border-[#2d6a4f]/20">
                {/* Next Week's Priorities */}
                <div className="space-y-2">
                  <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                    Next Week's Priorities
                  </h4>
                  <div className="space-y-2">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-serif italic text-xs font-bold text-[#2d6a4f] w-4">
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={logData.nextWeekPriorities?.[idx] || ""}
                          onChange={(e) =>
                            updatePriorityArray("nextWeekPriorities", idx, e.target.value)
                          }
                          placeholder={`Priority ${idx + 1}...`}
                          className="flex-1 bg-transparent border-b border-[#2d6a4f]/30 py-0.5 text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none focus:border-[#2d6a4f]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Income & Expenses Summary */}
                <div className="space-y-2">
                  <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                    Income &amp; Expenses Summary
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Circle className="w-3 h-3 text-[#2d6a4f] shrink-0" />
                      <span className="font-serif italic text-slate-500 min-w-[85px]">
                        Total Income:
                      </span>
                      <input
                        type="text"
                        value={logData.financials?.income || ""}
                        onChange={(e) =>
                          updateNestedField("financials", "income", e.target.value)
                        }
                        placeholder="$0.00"
                        className="flex-1 bg-transparent border-b border-[#2d6a4f]/30 py-0.5 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Circle className="w-3 h-3 text-[#2d6a4f] shrink-0" />
                      <span className="font-serif italic text-slate-500 min-w-[85px]">
                        Total Expenses:
                      </span>
                      <input
                        type="text"
                        value={logData.financials?.expenses || ""}
                        onChange={(e) =>
                          updateNestedField("financials", "expenses", e.target.value)
                        }
                        placeholder="$0.00"
                        className="flex-1 bg-transparent border-b border-[#2d6a4f]/30 py-0.5 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Circle className="w-3 h-3 text-[#2d6a4f] shrink-0" />
                      <span className="font-serif italic text-slate-500 min-w-[85px]">
                        Adjustments:
                      </span>
                      <input
                        type="text"
                        value={logData.financials?.notes || ""}
                        onChange={(e) =>
                          updateNestedField("financials", "notes", e.target.value)
                        }
                        placeholder="Budget notes..."
                        className="flex-1 bg-transparent border-b border-[#2d6a4f]/30 py-0.5 text-xs text-[#1b4332] focus:outline-none focus:border-[#2d6a4f]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =====================================================================
                RIGHT PAGE: WEEKLY JOURNAL
               ===================================================================== */}
            <div className="p-5 sm:p-7 lg:p-8 xl:p-10 space-y-6 bg-gradient-to-br from-white to-[#FAF7F0] relative">
              {/* Header with Monstera Leaf */}
              <div className="flex items-start justify-between pb-1 relative">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-[#1b4332] tracking-tight">
                    Weekly Journal
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-serif italic text-xs text-[#2d6a4f] font-semibold">
                      Week of:
                    </span>
                    <span className="font-serif italic text-xs font-bold text-[#1b4332] border-b border-[#2d6a4f]/40 pb-0.5">
                      {formattedWeekRange}
                    </span>
                  </div>
                </div>

                <div className="opacity-90 -mt-2 -mr-2 shrink-0">
                  <MonsteraLeafSVG className="w-16 h-16 sm:w-20 sm:h-20 text-[#2d6a4f]" />
                </div>
              </div>

              {/* 1. Top 3 Priorities This Week */}
              <div className="space-y-2">
                <h3 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                  Top 3 Priorities This Week:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="bg-[#eaf5ed] border-2 border-[#2d6a4f]/35 rounded-xl p-3 shadow-xs space-y-1.5 focus-within:border-[#1b4332] transition-colors"
                    >
                      <span className="font-serif italic text-xs font-bold text-[#1b4332] block">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={logData.top3Priorities?.[idx] || ""}
                        onChange={(e) =>
                          updatePriorityArray("top3Priorities", idx, e.target.value)
                        }
                        placeholder={`Priority ${idx + 1}...`}
                        className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none leading-snug"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Middle Row: To-Do List & Appointments & Events */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* To-Do List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                      To-Do List:
                    </h4>
                    <span className="font-mono text-[10px] text-[#2d6a4f]">
                      {todos.filter((t) => t.completed).length}/{todos.length} done
                    </span>
                  </div>

                  <div className="space-y-1.5 min-h-[90px] max-h-[140px] overflow-y-auto pr-1">
                    {todos.length === 0 ? (
                      <p className="font-serif italic text-xs text-[#2d6a4f]/50 py-2">
                        No tasks yet. Add one below.
                      </p>
                    ) : (
                      todos.map((todo) => (
                        <div
                          key={todo.id}
                          className="group flex items-center justify-between gap-2 py-0.5"
                        >
                          <button
                            type="button"
                            onClick={() => handleToggleTodo(todo.id)}
                            className="flex items-center gap-2 flex-1 text-left cursor-pointer min-w-0"
                          >
                            {todo.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2d6a4f] shrink-0" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-[#2d6a4f]/50 shrink-0 group-hover:text-[#2d6a4f]" />
                            )}
                            <span
                              className={`text-xs truncate ${
                                todo.completed
                                  ? "line-through text-[#2d6a4f]/50 font-serif italic"
                                  : "text-[#1b4332] font-medium"
                              }`}
                            >
                              {todo.title}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTodo(todo.id)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add To-Do Item */}
                  <form onSubmit={handleAddTodo} className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      placeholder="+ Add to-do item..."
                      className="flex-1 bg-transparent border-b border-[#2d6a4f]/30 py-0.5 text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none focus:border-[#2d6a4f]"
                    />
                    {newTodoTitle.trim() && (
                      <button
                        type="submit"
                        className="text-[11px] font-serif italic font-bold text-[#2d6a4f] hover:text-[#1b4332] cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </form>
                </div>

                {/* Appointments & Events */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                      Appointments &amp; Events:
                    </h4>
                    <span className="font-mono text-[10px] text-[#2d6a4f]">
                      {weekEvents.length} scheduled
                    </span>
                  </div>

                  <div className="space-y-1.5 min-h-[90px] max-h-[140px] overflow-y-auto pr-1">
                    {weekEvents.length === 0 ? (
                      <p className="font-serif italic text-xs text-[#2d6a4f]/50 py-2">
                        No events this week.
                      </p>
                    ) : (
                      weekEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-center justify-between gap-2 py-0.5 group"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Circle className="w-2.5 h-2.5 text-[#2d6a4f] shrink-0" />
                            <span className="font-mono text-[10px] text-[#2d6a4f] shrink-0">
                              {evt.hour ? `${evt.hour % 12 || 12}${evt.hour >= 12 ? "pm" : "am"}` : ""}
                            </span>
                            <span className="text-xs text-[#1b4332] truncate font-medium">
                              {evt.title}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Quick Event */}
                  <form onSubmit={handleAddQuickEvent} className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="+ Add event (e.g. 2pm Sync)..."
                      className="flex-1 bg-transparent border-b border-[#2d6a4f]/30 py-0.5 text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none focus:border-[#2d6a4f]"
                    />
                    {newEventTitle.trim() && (
                      <button
                        type="submit"
                        className="text-[11px] font-serif italic font-bold text-[#2d6a4f] hover:text-[#1b4332] cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* 3. Weekly Reflection: What went well / What could be improved / Goals */}
              <div className="space-y-1.5 pt-1">
                <h4 className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332]">
                  Weekly Reflection:
                </h4>
                <div className="border-2 border-[#2d6a4f]/35 rounded-2xl bg-[#eaf5ed]/70 divide-y divide-[#2d6a4f]/25 shadow-xs relative overflow-hidden">
                  {/* Subtle Monstera watermark */}
                  <div
                    className="absolute right-0 bottom-0 pointer-events-none opacity-10"
                    aria-hidden="true"
                  >
                    <MonsteraLeafSVG className="w-32 h-32 text-[#2d6a4f]" />
                  </div>

                  {/* Tier 1: What went well? */}
                  <div className="p-3 relative z-10 space-y-1">
                    <span className="font-serif italic text-xs font-semibold text-[#2d6a4f] block">
                      What went well?
                    </span>
                    <textarea
                      rows={2}
                      value={logData.reflection?.whatWentWell || ""}
                      onChange={(e) =>
                        updateNestedField("reflection", "whatWentWell", e.target.value)
                      }
                      placeholder="Wins, peaceful moments, productive flow sessions..."
                      className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Tier 2: What could be improved? */}
                  <div className="p-3 relative z-10 space-y-1">
                    <span className="font-serif italic text-xs font-semibold text-[#2d6a4f] block">
                      What could be improved?
                    </span>
                    <textarea
                      rows={2}
                      value={logData.reflection?.whatCouldBeImproved || ""}
                      onChange={(e) =>
                        updateNestedField("reflection", "whatCouldBeImproved", e.target.value)
                      }
                      placeholder="Boundaries, screen breaks, sprint pacing..."
                      className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Tier 3: Goals for next week: */}
                  <div className="p-3 relative z-10 space-y-1">
                    <span className="font-serif italic text-xs font-semibold text-[#2d6a4f] block">
                      Goals for next week:
                    </span>
                    <textarea
                      rows={2}
                      value={logData.reflection?.goalsNextWeek || ""}
                      onChange={(e) =>
                        updateNestedField("reflection", "goalsNextWeek", e.target.value)
                      }
                      placeholder="Intentions and recovery goals for the week ahead..."
                      className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleJournalTodo;
