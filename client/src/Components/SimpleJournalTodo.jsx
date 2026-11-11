import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  BookOpen,
  CheckSquare,
  Clock,
  Calendar,
  Save,
  Smile,
  X,
  Sparkles,
  RefreshCw,
  Flame,
  Award,
  Pin,
  Tag,
  ArrowRight,
  LayoutGrid,
  CalendarDays,
} from "lucide-react";
import { PixelFox, PixelOwl } from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import MoodCalendar from "./MoodCalendar";

// Aesthetic Mood Stamps (Clean, text-only, no emojis)
const MOOD_STAMPS = [
  { id: "Calm", label: "Calm", bg: "bg-teal-50 border-teal-300 text-teal-800" },
  { id: "Happy", label: "Joyful", bg: "bg-emerald-50 border-emerald-300 text-emerald-800" },
  { id: "Energized", label: "Hyped", bg: "bg-amber-50 border-amber-300 text-amber-800" },
  { id: "Steady", label: "Steady", bg: "bg-orange-50 border-orange-300 text-orange-800" },
  { id: "Tired", label: "Tired", bg: "bg-indigo-50 border-indigo-300 text-indigo-800" },
  { id: "Overwhelmed", label: "Heavy", bg: "bg-slate-100 border-slate-300 text-slate-800" },
];

// Quick Task Categories (Text-only tags)
const TASK_CATEGORIES = [
  { id: "code", label: "Code", color: "bg-blue-100 text-blue-900 border-blue-200" },
  { id: "care", label: "Self-Care", color: "bg-emerald-100 text-emerald-900 border-emerald-200" },
  { id: "life", label: "Routine", color: "bg-amber-100 text-amber-900 border-amber-200" },
  { id: "focus", label: "Goal", color: "bg-purple-100 text-purple-900 border-purple-200" },
];

export function SimpleJournalTodo({ onRefreshNeeded }) {
  // ==========================================
  // 1. TO-DO STATE (Pending & Completed Tasks)
  // ==========================================
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem("sanctuary_todos");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed)
          ? parsed.filter((t) => t.id !== 1 && t.id !== 2 && t.id !== 3)
          : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("code");
  const [taskFilter, setTaskFilter] = useState("all"); // "all" | "pending" | "completed"
  const [activeView, setActiveView] = useState("desk"); // "desk" | "calendar"
  const [companionQuote, setCompanionQuote] = useState(
    "One task at a time. Your peace matters more than story points!"
  );

  // 7-Day Quick Selection Strip for the current week
  const weekDates = React.useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 is Sun
    const start = new Date(today);
    start.setDate(today.getDate() - currentDay);
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return {
        dateStr: iso,
        dayName: d.toLocaleDateString(undefined, { weekday: "short" }),
        dayNumber: d.getDate(),
        isToday: iso === new Date().toISOString().slice(0, 10),
      };
    });
  }, []);

  // Sync tasks with localStorage
  useEffect(() => {
    try {
      localStorage.setItem("sanctuary_todos", JSON.stringify(tasks));
    } catch (e) {
      console.warn("Could not save todos locally", e);
    }
  }, [tasks]);

  const handleAddTask = (e) => {
    if (e) e.preventDefault();
    const trimmed = newTaskTitle.trim();
    if (!trimmed) {
      toast.error("Please enter a task name.");
      return;
    }

    sounds.playClick();
    const cat = TASK_CATEGORIES.find((c) => c.id === selectedCategory) || TASK_CATEGORIES[0];
    const newTask = {
      id: Date.now(),
      title: trimmed,
      category: cat.id,
      categoryLabel: cat.label,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
    setCompanionQuote("Task added! Let's crush it together.");
    toast.success("Task added to your list!");
  };

  const handleToggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedStatus = !t.completed;
          if (updatedStatus) {
            sounds.playSuccess();
            setCompanionQuote("Awesome job! Another item cleared!");
            toast.success("Task completed! Keep shining.");
          } else {
            sounds.playPop(350);
          }
          return {
            ...t,
            completed: updatedStatus,
            completedAt: updatedStatus ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId) => {
    sounds.playClick();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast("Task deleted.");
  };

  const pendingTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const displayedTasks =
    taskFilter === "pending"
      ? pendingTasks
      : taskFilter === "completed"
      ? completedTasks
      : tasks;

  // ==========================================
  // 2. JOURNAL STATE (Simple Journal Entry)
  // ==========================================
  const [journalContent, setJournalContent] = useState("");
  const [journalDate, setJournalDate] = useState(new Date().toISOString().slice(0, 10));
  const [journalMood, setJournalMood] = useState("Calm");
  const [isSavingJournal, setIsSavingJournal] = useState(false);

  const handleSaveJournal = async (e) => {
    if (e) e.preventDefault();
    const content = journalContent.trim();
    if (!content) {
      toast.error("Please write something in your journal entry.");
      return;
    }

    setIsSavingJournal(true);
    sounds.playClick();

    try {
      const payload = {
        mood: journalMood,
        content,
        entryDate: journalDate,
        tags: ["Daily"],
        isPrivate: true,
      };

      await api.post("/api/journal", payload);
      setJournalContent("");
      sounds.playSuccess();
      setCompanionQuote("Your reflection has been safely sealed in your vault.");
      toast.success("Journal entry saved successfully!");
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      // Local backup save
      try {
        const local = localStorage.getItem("sanctuary_journal_entries");
        const parsed = local ? JSON.parse(local) : [];
        parsed.unshift({
          id: Date.now(),
          mood: journalMood,
          content,
          entry_date: journalDate,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("sanctuary_journal_entries", JSON.stringify(parsed));
      } catch (e) {}

      setJournalContent("");
      sounds.playSuccess();
      toast.success("Journal saved to local sanctuary!");
    } finally {
      setIsSavingJournal(false);
    }
  };

  return (
    <div className="w-full space-y-7 animate-in fade-in duration-200 selection:bg-[#0a1b10] selection:text-[#64DC4C]">
      
      {/* =========================================================================
          TOP BANNER: Fox & Owl Companion Header + Daily Progress Bar
         ========================================================================= */}
      <div className="relative overflow-hidden bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#0a1b10]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          {/* Companion Mascot & Speech Bubble */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <PixelFox className="w-12 h-12 sm:w-14 sm:h-14" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#64DC4C] border-2 border-[#0a1b10] rounded-full animate-ping" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#64DC4C] border-2 border-[#0a1b10] rounded-full" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#64DC4C]/25 text-[#0a1b10] text-[11px] font-black uppercase font-mono tracking-wider border border-[#0a1b10]/20">
                <Sparkles className="w-3 h-3 text-[#0a1b10]" />
                <span>Daily Sanctuary Hub</span>
              </div>
              <p className="text-sm font-extrabold text-[#0a1b10] leading-snug">
                {companionQuote}
              </p>
            </div>
          </div>

          {/* Daily Progress Widget */}
          <div className="w-full md:w-72 bg-white border-2 border-[#0a1b10] rounded-2xl p-3.5 shadow-[2px_2px_0px_#0a1b10] space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-600 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Daily Momentum</span>
              </span>
              <span className="text-[#0a1b10] bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                {completionPercentage}%
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-3 bg-slate-100 rounded-full border border-[#0a1b10] overflow-hidden p-0.5">
              <div
                className="h-full bg-[#64DC4C] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 font-medium">
              <span>{pendingTasks.length} pending</span>
              <span>{completedTasks.length} completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW SWITCHER: Writing Desk vs Sanctuary Calendar
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex items-center p-1 bg-white border-2 border-[#0a1b10] rounded-2xl shadow-[2px_2px_0px_#0a1b10] text-xs font-mono font-black">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveView("desk");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeView === "desk"
                ? "bg-[#0a1b10] text-[#64DC4C]"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Writing Desk &amp; Tasks</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveView("calendar");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeView === "calendar"
                ? "bg-[#0a1b10] text-[#64DC4C]"
                : "text-slate-600 hover:text-black"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Month / Week / Day Calendar</span>
          </button>
        </div>

        {activeView === "desk" ? (
          <span className="text-xs font-mono font-bold text-slate-600 flex items-center gap-1.5">
            <span>Journal Date:</span>
            <strong className="text-[#0a1b10] bg-white px-2 py-0.5 rounded-lg border border-[#0a1b10]">
              {journalDate}
            </strong>
          </span>
        ) : (
          <span className="text-xs font-mono font-bold text-emerald-800">
            Click any day to schedule focus or write notes
          </span>
        )}
      </div>

      {/* =========================================================================
          CONDITIONAL VIEW: Calendar View vs 2-Column Desk View
         ========================================================================= */}
      {activeView === "calendar" ? (
        <MoodCalendar
          onWriteForDate={(date) => {
            setJournalDate(date);
            setActiveView("desk");
            toast.success(`Switched to journal desk for ${date}!`);
          }}
        />
      ) : (
        /* =========================================================================
            MAIN 2-COLUMN WORKSPACE:
            Left (6 cols): Tactile To-Do Board
            Right (6 cols): Cozy Journal Notebook
           ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        
        {/* =========================================================================
            SECTION 1: TACTILE TO-DO BOARD (Pending & Completed)
           ========================================================================= */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-5 sm:p-6 shadow-[5px_5px_0px_#0a1b10] space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-[#0a1b10]/15">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#64DC4C] border-2 border-[#0a1b10] text-[#0a1b10] flex items-center justify-center shadow-[1px_1px_0px_#0a1b10]">
                  <CheckSquare className="w-5 h-5 text-[#0a1b10]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0a1b10] font-display">
                    Daily Tasks
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">Plan your daily focus &amp; check them off</p>
                </div>
              </div>

              {/* Status Pill */}
              <span className="text-[11px] font-mono font-black px-2.5 py-1 rounded-xl bg-white border-2 border-[#0a1b10] text-[#0a1b10] shadow-[1px_1px_0px_#0a1b10]">
                {pendingTasks.length} left
              </span>
            </div>

            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="What are you working on today?..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white border-2 border-[#0a1b10] text-sm text-[#0a1b10] font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#64DC4C] shadow-[2px_2px_0px_#0a1b10] transition"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-[#64DC4C] hover:bg-[#52c83b] active:translate-y-0.5 text-[#0a1b10] text-xs font-black uppercase tracking-wide border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] cursor-pointer flex items-center gap-1.5 shrink-0 transition-transform"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add</span>
                </button>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase mr-1">
                  Tag:
                </span>
                {TASK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sounds.playPop(300);
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? "border-[#0a1b10] bg-[#0a1b10] text-[#64DC4C] shadow-[1px_1px_0px_#0a1b10]"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </form>

            {/* Filter Tabs: All | Pending | Completed */}
            <div className="flex items-center justify-between p-1 bg-white border-2 border-[#0a1b10] rounded-2xl shadow-[2px_2px_0px_#0a1b10] text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => setTaskFilter("all")}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
                  taskFilter === "all"
                    ? "bg-[#0a1b10] text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter("pending")}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
                  taskFilter === "pending"
                    ? "bg-[#0a1b10] text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Pending ({pendingTasks.length})
              </button>
              <button
                type="button"
                onClick={() => setTaskFilter("completed")}
                className={`flex-1 py-1.5 rounded-xl transition cursor-pointer text-center ${
                  taskFilter === "completed"
                    ? "bg-[#0a1b10] text-white"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Done ({completedTasks.length})
              </button>
            </div>

            {/* Task Items List */}
            <div className="space-y-2.5 min-h-[220px]">
              {displayedTasks.length === 0 ? (
                <div className="py-10 px-4 rounded-2xl bg-white border-2 border-dashed border-[#0a1b10]/20 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <PixelOwl className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-black text-[#0a1b10]">
                    {taskFilter === "completed"
                      ? "No completed tasks yet."
                      : "All caught up! Zero pending tasks."}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Take a deep breath or add a new focus item above.
                  </p>
                </div>
              ) : (
                displayedTasks.map((task) => {
                  const catConfig =
                    TASK_CATEGORIES.find((c) => c.id === task.category) || TASK_CATEGORIES[0];
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${
                        task.completed
                          ? "bg-emerald-50/60 border-emerald-300 text-slate-500 shadow-none opacity-85"
                          : "bg-white border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] hover:translate-x-0.5 hover:-translate-y-0.5"
                      }`}
                    >
                      {/* Checkbox & Task Text */}
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task.id)}
                        className="flex items-center gap-3 text-left flex-1 cursor-pointer min-w-0"
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            task.completed
                              ? "bg-[#64DC4C] border-[#0a1b10] shadow-[1px_1px_0px_#0a1b10]"
                              : "border-[#0a1b10] bg-white group-hover:bg-[#64DC4C]/20"
                          }`}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#0a1b10] stroke-[3]" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-[#0a1b10]" />
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-bold truncate leading-snug ${
                              task.completed
                                ? "line-through text-slate-400"
                                : "text-[#0a1b10]"
                            }`}
                          >
                            {task.title}
                          </span>

                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                            <span className={`px-1.5 py-0.2 rounded border ${catConfig.color}`}>
                              {catConfig.label}
                            </span>
                            {task.completedAt && (
                              <span className="text-emerald-700 font-bold">
                                Done at {task.completedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Delete Task Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer shrink-0 ml-2"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Clear Done action */}
            {completedTasks.length > 0 && (
              <div className="pt-2 border-t border-[#0a1b10]/10 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-mono text-[11px]">
                  {completedTasks.length} completed tasks logged
                </span>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setTasks((prev) => prev.filter((t) => !t.completed));
                    toast("Cleared all completed tasks!");
                  }}
                  className="font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  Clear Completed
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: COZY JOURNAL NOTEBOOK (Write Daily Reflection)
           ========================================================================= */}
        <div className="lg:col-span-6 space-y-5">
          {/* WRITE ENTRY CARD */}
          <div className="bg-[#FCFAF4] border-3 border-[#0a1b10] rounded-3xl p-5 sm:p-7 shadow-[5px_5px_0px_#0a1b10] space-y-4">
            {/* Header with Date Badge */}
            <div className="flex flex-wrap items-center justify-between pb-3.5 border-b-2 border-[#0a1b10]/15 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#64DC4C] border-2 border-[#0a1b10] text-[#0a1b10] flex items-center justify-center shadow-[1px_1px_0px_#0a1b10]">
                  <BookOpen className="w-5 h-5 text-[#0a1b10]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#0a1b10] font-display">
                    Daily Journal
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium">Safe, private reflections to untangle your day</p>
                </div>
              </div>

              {/* Date Input & Quick Calendar Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-white border-2 border-[#0a1b10] rounded-xl shadow-[1px_1px_0px_#0a1b10]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="date"
                    value={journalDate}
                    onChange={(e) => setJournalDate(e.target.value)}
                    className="text-xs font-mono font-bold text-[#0a1b10] bg-transparent focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setActiveView("calendar");
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-[#0a1b10] text-xs font-mono font-bold border-2 border-[#0a1b10] shadow-[1px_1px_0px_#0a1b10] cursor-pointer flex items-center gap-1.5 transition-colors"
                  title="Open Month / Week / Day Calendar"
                >
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Calendar</span>
                </button>
              </div>
            </div>

            {/* Quick 7-Day Date Picker Strip */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Select Day of the Week:</span>
                <span>Week of {weekDates[0]?.dayName} {weekDates[0]?.dayNumber}</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {weekDates.map((day) => {
                  const isSelected = journalDate === day.dateStr;
                  return (
                    <button
                      key={day.dateStr}
                      type="button"
                      onClick={() => {
                        sounds.playPop(340);
                        setJournalDate(day.dateStr);
                      }}
                      className={`py-1.5 px-1 rounded-xl text-center border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#0a1b10] border-[#0a1b10] text-[#64DC4C] shadow-[1px_1px_0px_#64DC4C] scale-105"
                          : day.isToday
                          ? "bg-emerald-100/70 border-emerald-500 text-[#0a1b10]"
                          : "bg-white border-[#0a1b10]/20 text-slate-700 hover:border-[#0a1b10]"
                      }`}
                      title={day.dateStr}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase block opacity-80 leading-none">
                        {day.dayName}
                      </span>
                      <span className="text-xs font-black font-mono block mt-0.5">
                        {day.dayNumber}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Prompt Pill (Clickable inspiration) */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-amber-950 text-xs shadow-xs">
              <div className="flex items-start gap-2.5 min-w-0 pr-2">
                <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="font-semibold leading-snug truncate sm:whitespace-normal">
                  {DAILY_PROMPTS[promptIndex]}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleUsePrompt(DAILY_PROMPTS[promptIndex])}
                  className="px-2.5 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-900 font-bold text-[11px] cursor-pointer transition"
                  title="Insert this prompt into your note"
                >
                  Use Prompt
                </button>
                <button
                  type="button"
                  onClick={handleNextPrompt}
                  className="p-1 rounded-xl text-amber-800 hover:bg-amber-200/60 cursor-pointer"
                  title="Next prompt"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Aesthetic Mood Stamps Selector */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                How do you feel right now?
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {MOOD_STAMPS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      sounds.playPop(360);
                      setJournalMood(m.id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                      journalMood === m.id
                        ? "border-[#0a1b10] bg-[#64DC4C] text-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] scale-105"
                        : "border-[#0a1b10]/20 bg-white text-slate-700 hover:border-[#0a1b10]"
                    }`}
                  >
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notebook Writing Area */}
            <div className="space-y-3">
              <div className="relative">
                <textarea
                  rows={7}
                  value={journalContent}
                  onChange={(e) => setJournalContent(e.target.value)}
                  placeholder="What's on your mind? What felt good today, what drained your energy, or what are you celebrating?..."
                  className="w-full p-4 rounded-2xl bg-white border-2 border-[#0a1b10] text-[#0a1b10] text-sm leading-relaxed placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#64DC4C] shadow-[3px_3px_0px_#0a1b10] transition resize-y font-sans"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-slate-400">
                  {journalContent.length} characters
                </span>

                <button
                  type="button"
                  disabled={isSavingJournal || !journalContent.trim()}
                  onClick={handleSaveJournal}
                  className="px-5 py-2.5 rounded-2xl bg-[#0a1b10] hover:bg-black active:translate-y-0.5 text-[#64DC4C] disabled:opacity-40 disabled:cursor-not-allowed text-xs sm:text-sm font-black uppercase tracking-wide border-2 border-[#0a1b10] shadow-[2px_2px_0px_#64DC4C] cursor-pointer flex items-center gap-2 transition-transform"
                >
                  <Save className="w-4 h-4 text-[#64DC4C]" />
                  <span>{isSavingJournal ? "Saving..." : "Save Journal Entry"}</span>
                </button>
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
