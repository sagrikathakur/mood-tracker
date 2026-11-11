import React, { useState, useEffect, useMemo } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  CalendarDays,
  Calendar,
  Save,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import MoodCalendar from "./MoodCalendar";
import journalWallpaper from "../assets/journal_page_wallpaer.jpg";

export function SimpleJournalTodo({ onRefreshNeeded }) {
  // =========================================================================
  // 1. DATE STATE & NAVIGATION
  // =========================================================================
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().slice(0, 10);
  });
  const [activeView, setActiveView] = useState("journal"); // "journal" | "calendar"
  const [isSaving, setIsSaving] = useState(false);

  const formattedDate = useMemo(() => {
    try {
      const parts = selectedDate.split("-");
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  const handlePrevDay = () => {
    sounds.playClick();
    const parts = selectedDate.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleNextDay = () => {
    sounds.playClick();
    const parts = selectedDate.split("-");
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    sounds.playClick();
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  // =========================================================================
  // 2. DAILY JOURNAL STATE (Clean, Simple, Zero Emojis, Zero Expenses)
  // =========================================================================
  const defaultDailyData = {
    wins: "",
    whatWentWell: "",
    whatCouldBeImproved: "",
    journalNotes: "",
    oneSentence: "",
    top3Priorities: ["", "", ""],
  };

  const [dailyData, setDailyData] = useState(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_daily_journal_${selectedDate}`);
      if (saved) {
        return { ...defaultDailyData, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultDailyData;
  });

  // Re-sync on date switch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sanctuary_daily_journal_${selectedDate}`);
      if (saved) {
        setDailyData({ ...defaultDailyData, ...JSON.parse(saved) });
      } else {
        setDailyData(defaultDailyData);
      }
    } catch {
      setDailyData(defaultDailyData);
    }
  }, [selectedDate]);

  const updateDailyField = (field, value) => {
    setDailyData((prev) => {
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(`sanctuary_daily_journal_${selectedDate}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const updatePriority = (index, value) => {
    setDailyData((prev) => {
      const arr = [...(prev.top3Priorities || ["", "", ""])];
      arr[index] = value;
      const updated = { ...prev, top3Priorities: arr };
      try {
        localStorage.setItem(`sanctuary_daily_journal_${selectedDate}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // =========================================================================
  // 3. TO-DO TASKS STATE (Pending & Completed)
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
  const [todoFilter, setTodoFilter] = useState("all"); // "all" | "pending" | "completed"

  useEffect(() => {
    try {
      localStorage.setItem("sanctuary_todos", JSON.stringify(todos));
    } catch {}
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
      date: selectedDate,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [newTask, ...prev]);
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

  const pendingTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const displayedTodos =
    todoFilter === "pending"
      ? pendingTodos
      : todoFilter === "completed"
      ? completedTodos
      : todos;

  // =========================================================================
  // 4. SAVE JOURNAL ENTRY
  // =========================================================================
  const handleSave = async () => {
    setIsSaving(true);
    sounds.playClick();

    try {
      localStorage.setItem(`sanctuary_daily_journal_${selectedDate}`, JSON.stringify(dailyData));

      const summary = [
        `Wins: ${dailyData.wins || "None listed"}`,
        `What went well: ${dailyData.whatWentWell || ""}`,
        `What could be improved: ${dailyData.whatCouldBeImproved || ""}`,
        `Today in one sentence: ${dailyData.oneSentence || ""}`,
        `Notes:\n${dailyData.journalNotes || ""}`,
      ].join("\n\n");

      await api.post("/api/journal", {
        mood: "Calm",
        content: summary,
        entryDate: selectedDate,
        tags: ["DailyJournal"],
        isPrivate: true,
      });

      sounds.playSuccess();
      toast.success("Journal saved successfully!");
      if (onRefreshNeeded) onRefreshNeeded();
    } catch {
      sounds.playSuccess();
      toast.success("Saved to local sanctuary!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-4 select-none animate-in fade-in duration-200">
      {/* =========================================================================
          MINIMAL HEADER: Date Controls, Calendar Toggle, and Save
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 py-1">
        {/* Date Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 rounded-xl bg-white/80 backdrop-blur-md text-[#1b4332] hover:bg-white border border-[#2d6a4f]/25 shadow-2xs transition cursor-pointer"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md text-[#1b4332] font-serif italic font-bold text-xs border border-[#2d6a4f]/25 hover:bg-white transition cursor-pointer shadow-2xs"
          >
            Today
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md border border-[#2d6a4f]/25 rounded-xl shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="font-serif italic font-bold text-xs text-[#1b4332] bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            className="p-1.5 rounded-xl bg-white/80 backdrop-blur-md text-[#1b4332] hover:bg-white border border-[#2d6a4f]/25 shadow-2xs transition cursor-pointer"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="font-serif italic font-bold text-xs sm:text-sm text-[#1b4332] pl-1 drop-shadow-xs bg-white/60 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/60">
            {formattedDate}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveView(activeView === "journal" ? "calendar" : "journal")}
            className="px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-md border border-[#2d6a4f]/25 text-xs font-serif italic font-semibold text-[#2d6a4f] hover:bg-white cursor-pointer flex items-center gap-1.5 shadow-2xs transition"
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{activeView === "journal" ? "Calendar View" : "Journal Desk"}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-white font-serif italic font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm active:translate-y-0.5 transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? "Saving..." : "Save Entry"}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW: Calendar Matrix vs Fresh Botanical Journal & To-Do Spread
         ========================================================================= */}
      {activeView === "calendar" ? (
        <MoodCalendar
          onWriteForDate={(dateStr) => {
            setSelectedDate(dateStr);
            setActiveView("journal");
            toast.success(`Switched to journal for ${dateStr}!`);
          }}
        />
      ) : (
        /* =========================================================================
            FRESH SIMPLE JOURNAL & TO-DO (Balanced Translucent Frosted Glass)
           ========================================================================= */
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            
            {/* ===================================================================
                LEFT COLUMN: SIMPLE DAILY JOURNAL (Soft Translucent Parchment Glass)
               =================================================================== */}
            <div className="bg-[#FCFAF7]/80 backdrop-blur-md rounded-2xl border-2 border-white/80 p-5 sm:p-7 shadow-xl space-y-5">
              {/* Header */}
              <div className="pb-2 border-b border-[#2d6a4f]/15 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#1b4332] tracking-tight">
                    Daily Journal
                  </h2>
                  <p className="font-serif italic text-xs text-[#2d6a4f] mt-0.5">
                    Thoughts, reflections, and victories for today
                  </p>
                </div>
                <BookOpen className="w-6 h-6 text-[#2d6a4f] opacity-80" />
              </div>

              {/* 1. Today's Wins */}
              <div className="bg-[#eaf5ed]/80 border border-[#2d6a4f]/25 rounded-xl p-3.5 shadow-2xs space-y-1">
                <span className="font-serif italic text-xs font-bold text-[#1b4332] block">
                  Today's Wins &amp; Gratitude
                </span>
                <textarea
                  rows={3}
                  value={dailyData.wins}
                  onChange={(e) => updateDailyField("wins", e.target.value)}
                  placeholder="What small or big victories happened today? What are you grateful for?..."
                  className="w-full bg-transparent border-0 resize-none text-xs leading-relaxed text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none"
                />
              </div>

              {/* 2. Structured Daily Reflection */}
              <div className="border border-[#2d6a4f]/25 rounded-xl bg-[#eaf5ed]/65 divide-y divide-[#2d6a4f]/15 shadow-2xs overflow-hidden">
                <div className="p-3 space-y-1">
                  <span className="font-serif italic text-xs font-semibold text-[#2d6a4f] block">
                    What went well today?
                  </span>
                  <textarea
                    rows={2}
                    value={dailyData.whatWentWell}
                    onChange={(e) => updateDailyField("whatWentWell", e.target.value)}
                    placeholder="Focus sessions, progress made, peaceful moments..."
                    className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="p-3 space-y-1">
                  <span className="font-serif italic text-xs font-semibold text-[#2d6a4f] block">
                    What could be improved?
                  </span>
                  <textarea
                    rows={2}
                    value={dailyData.whatCouldBeImproved}
                    onChange={(e) => updateDailyField("whatCouldBeImproved", e.target.value)}
                    placeholder="Boundaries, screen breaks, pacing..."
                    className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* 3. Daily Freeform Journal Notes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-serif italic text-xs font-bold text-[#1b4332]">
                    Journal Notes &amp; Thoughts
                  </span>
                  <span className="font-serif italic text-[11px] text-slate-500 font-medium">
                    {dailyData.journalNotes?.length || 0} characters
                  </span>
                </div>
                <div className="bg-white/85 border border-[#2d6a4f]/25 rounded-xl p-3 shadow-2xs focus-within:border-[#1b4332] transition-colors">
                  <textarea
                    rows={5}
                    value={dailyData.journalNotes}
                    onChange={(e) => updateDailyField("journalNotes", e.target.value)}
                    placeholder="Write freely: thoughts, feelings, brain dumps, or ideas from today..."
                    className="w-full bg-transparent border-0 resize-y text-xs sm:text-sm leading-relaxed text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ===================================================================
                RIGHT COLUMN: SIMPLE DAILY TO-DO (Soft Translucent Parchment Glass)
               =================================================================== */}
            <div className="bg-[#FCFAF7]/80 backdrop-blur-md rounded-2xl border-2 border-white/80 p-5 sm:p-7 shadow-xl space-y-5">
              {/* Header */}
              <div className="pb-2 border-b border-[#2d6a4f]/15 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#1b4332] tracking-tight">
                    Daily To-Do
                  </h2>
                  <p className="font-serif italic text-xs text-[#2d6a4f] mt-0.5">
                    {completedTodos.length} of {todos.length} tasks completed
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-serif italic text-xs font-bold text-[#2d6a4f] px-2.5 py-1 bg-white/85 border border-[#2d6a4f]/25 rounded-lg shadow-2xs">
                    {pendingTodos.length} pending
                  </span>
                </div>
              </div>

              {/* 1. Top 3 Priorities for Today */}
              <div className="space-y-2">
                <span className="font-serif italic text-xs font-bold text-[#1b4332] block">
                  Top 3 Priorities Today
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[0, 1, 2].map((idx) => (
                    <div
                      key={idx}
                      className="bg-[#eaf5ed]/80 border border-[#2d6a4f]/25 rounded-xl p-2.5 shadow-2xs space-y-1 focus-within:border-[#1b4332] transition-colors"
                    >
                      <span className="font-serif italic text-xs font-bold text-[#1b4332] block">
                        Priority {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={dailyData.top3Priorities?.[idx] || ""}
                        onChange={(e) => updatePriority(idx, e.target.value)}
                        placeholder={`Focus ${idx + 1}...`}
                        className="w-full bg-transparent border-0 resize-none text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/40 focus:outline-none leading-snug"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Tasks Board */}
              <div className="space-y-3">
                {/* Form to Add Task */}
                <form onSubmit={handleAddTodo} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="Add a task for today..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-white/85 border border-[#2d6a4f]/25 text-xs text-[#1b4332] font-medium placeholder:text-[#2d6a4f]/40 focus:outline-none focus:border-[#1b4332] shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={!newTodoTitle.trim()}
                    className="px-4 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] disabled:opacity-40 text-white font-serif italic font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </form>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between p-1 bg-white/80 border border-[#2d6a4f]/25 rounded-xl text-xs font-serif italic font-semibold">
                  <button
                    type="button"
                    onClick={() => setTodoFilter("all")}
                    className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                      todoFilter === "all"
                        ? "bg-[#2d6a4f] text-white shadow-2xs"
                        : "text-[#2d6a4f] hover:text-[#1b4332]"
                    }`}
                  >
                    All ({todos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTodoFilter("pending")}
                    className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                      todoFilter === "pending"
                        ? "bg-[#2d6a4f] text-white shadow-2xs"
                        : "text-[#2d6a4f] hover:text-[#1b4332]"
                    }`}
                  >
                    Pending ({pendingTodos.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTodoFilter("completed")}
                    className={`flex-1 py-1 rounded-lg text-center transition cursor-pointer ${
                      todoFilter === "completed"
                        ? "bg-[#2d6a4f] text-white shadow-2xs"
                        : "text-[#2d6a4f] hover:text-[#1b4332]"
                    }`}
                  >
                    Done ({completedTodos.length})
                  </button>
                </div>

                {/* Task List */}
                <div className="space-y-1.5 min-h-[160px] max-h-[260px] overflow-y-auto pr-1">
                  {displayedTodos.length === 0 ? (
                    <div className="py-8 px-4 rounded-xl border border-dashed border-[#2d6a4f]/25 text-center space-y-1 bg-white/60">
                      <p className="font-serif italic text-xs font-bold text-[#1b4332]">
                        {todoFilter === "completed"
                          ? "No completed tasks yet."
                          : "No tasks here. Add one above to get started."}
                      </p>
                    </div>
                  ) : (
                    displayedTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className={`group flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
                          todo.completed
                            ? "bg-[#eaf5ed]/60 border-[#2d6a4f]/15 text-[#2d6a4f]/60"
                            : "bg-white/85 border-[#2d6a4f]/25 text-[#1b4332] shadow-2xs hover:border-[#2d6a4f]"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleTodo(todo.id)}
                          className="flex items-center gap-2.5 flex-1 text-left cursor-pointer min-w-0"
                        >
                          {todo.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#2d6a4f] shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#2d6a4f]/40 shrink-0 group-hover:text-[#2d6a4f]" />
                          )}
                          <span
                            className={`text-xs truncate ${
                              todo.completed
                                ? "line-through font-serif italic text-[#2d6a4f]/60"
                                : "font-medium text-[#1b4332]"
                            }`}
                          >
                            {todo.title}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Clear Completed Action */}
                {completedTodos.length > 0 && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#2d6a4f]/15 text-xs">
                    <span className="font-serif italic text-slate-500 text-[11px]">
                      {completedTodos.length} completed tasks
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setTodos((prev) => prev.filter((t) => !t.completed));
                        toast("Cleared completed tasks.");
                      }}
                      className="font-serif italic text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                    >
                      Clear Completed
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Today in One Sentence */}
              <div className="space-y-1 pt-1">
                <span className="font-serif italic text-xs font-bold text-[#1b4332] block">
                  Today in One Sentence
                </span>
                <div className="bg-[#eaf5ed]/80 border border-[#2d6a4f]/25 rounded-xl p-2.5 shadow-2xs focus-within:border-[#1b4332] transition-colors">
                  <input
                    type="text"
                    value={dailyData.oneSentence}
                    onChange={(e) => updateDailyField("oneSentence", e.target.value)}
                    placeholder="One sentence that captures your day..."
                    className="w-full bg-transparent border-0 text-xs text-[#1b4332] placeholder:text-[#2d6a4f]/35 focus:outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
      )}
    </div>
  );
}

export default SimpleJournalTodo;
