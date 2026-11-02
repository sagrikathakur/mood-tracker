import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Plus,
  Flame,
  Moon,
  Droplets,
  Tv,
  Target,
  Sparkles,
  Trash2,
  Clock,
  Check,
  Award,
  Code2,
  X,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";

const HabitsAndGoals = ({ onRefreshNeeded }) => {
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [todayMetrics, setTodayMetrics] = useState({
    sleep_hours: 7.5,
    sleep_quality: 4,
    stress_level: 3,
    water_glasses: 5,
    screen_time_hours: 3.5,
  });
  const [loading, setLoading] = useState(true);
  const [savingMetrics, setSavingMetrics] = useState(false);

  // Modals for new items
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [newHabitCategory, setNewHabitCategory] = useState("mindfulness");

  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDesc, setNewGoalDesc] = useState("");
  const [newGoalDate, setNewGoalDate] = useState("");

  const fetchData = async () => {
    try {
      const [habitsRes, goalsRes, metricsRes] = await Promise.all([
        api.get("/api/habits"),
        api.get("/api/goals"),
        api.get("/api/wellness/today"),
      ]);

      if (habitsRes.data?.habits) setHabits(habitsRes.data.habits);
      if (goalsRes.data?.goals) setGoals(goalsRes.data.goals);
      if (metricsRes.data?.today) {
        setTodayMetrics({
          sleep_hours: metricsRes.data.today.sleep_hours || 7.5,
          sleep_quality: metricsRes.data.today.sleep_quality || 4,
          stress_level: metricsRes.data.today.stress_level || 3,
          water_glasses: metricsRes.data.today.water_glasses || 0,
          screen_time_hours: metricsRes.data.today.screen_time_hours || 0,
        });
      }
    } catch (err) {
      console.warn("Could not load habits & goals data:", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1. Toggle Habit
  const handleToggleHabit = async (habitId) => {
    sounds.playClick();
    try {
      const res = await api.post(`/api/habits/${habitId}/toggle`);
      const isCompleted = res.data?.completed;
      setHabits((prev) =>
        prev.map((h) =>
          h.id === habitId
            ? {
                ...h,
                completed_today: isCompleted,
                completions_last_30_days: isCompleted
                  ? h.completions_last_30_days + 1
                  : Math.max(0, h.completions_last_30_days - 1),
              }
            : h
        )
      );
      if (isCompleted) {
        sounds.playSuccess();
        toast.success("Dev habit checked off! Consistency prevents burnout.", { icon: "🌱" });
      } else {
        sounds.playPop();
      }
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      toast.error("Could not toggle habit.");
    }
  };

  // Add Habit
  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    sounds.playClick();
    try {
      const res = await api.post("/api/habits", {
        title: newHabitTitle.trim(),
        category: newHabitCategory,
      });
      if (res.data?.habit) {
        setHabits((prev) => [...prev, { ...res.data.habit, completed_today: false, completions_last_30_days: 0 }]);
        setShowAddHabitModal(false);
        setNewHabitTitle("");
        sounds.playSuccess();
        toast.success("New developer habit created!");
      }
    } catch (err) {
      toast.error("Could not create habit.");
    }
  };

  const handleDeleteHabit = async (id) => {
    if (!window.confirm("Delete this habit?")) return;
    sounds.playPop();
    try {
      await api.delete(`/api/habits/${id}`);
      setHabits((prev) => prev.filter((h) => h.id !== id));
      toast.success("Habit removed.");
    } catch (err) {
      toast.error("Could not delete habit.");
    }
  };

  // 2. Save Wellness Metrics
  const handleSaveMetrics = async () => {
    sounds.playClick();
    setSavingMetrics(true);
    try {
      await api.post("/api/wellness/daily", todayMetrics);
      sounds.playSuccess();
      toast.success("Daily dev metrics saved!", { icon: "💧" });
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      toast.error("Could not save metrics.");
    } finally {
      setSavingMetrics(false);
    }
  };

  // 3. Goal Actions
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    sounds.playClick();
    try {
      const res = await api.post("/api/goals", {
        title: newGoalTitle.trim(),
        targetDescription: newGoalDesc.trim(),
        targetDate: newGoalDate || null,
      });
      if (res.data?.goal) {
        setGoals((prev) => [res.data.goal, ...prev]);
        setShowAddGoalModal(false);
        setNewGoalTitle("");
        setNewGoalDesc("");
        setNewGoalDate("");
        sounds.playSuccess();
        toast.success("Wellness milestone set!", { icon: "🎯" });
      }
    } catch (err) {
      toast.error("Could not create goal.");
    }
  };

  const handleUpdateGoalProgress = async (goalId, newProgress) => {
    sounds.playClick();
    const isCompleted = newProgress >= 100;
    try {
      const res = await api.patch(`/api/goals/${goalId}`, {
        progress: newProgress,
        completed: isCompleted,
      });
      if (res.data?.goal) {
        setGoals((prev) => prev.map((g) => (g.id === goalId ? res.data.goal : g)));
        if (isCompleted) {
          sounds.playSuccess();
          toast.success("Milestone achieved! Great balance maintained.", { icon: "🎉" });
        } else {
          sounds.playPop();
        }
      }
    } catch (err) {
      toast.error("Could not update goal progress.");
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm("Remove this goal?")) return;
    sounds.playPop();
    try {
      await api.delete(`/api/goals/${id}`);
      setGoals((prev) => prev.filter((g) => g.id !== id));
      toast.success("Goal removed.");
    } catch (err) {
      toast.error("Could not delete goal.");
    }
  };

  const completedHabitsCount = habits.filter((h) => h.completed_today).length;
  const habitCompletionRate =
    habits.length > 0 ? Math.round((completedHabitsCount / habits.length) * 100) : 0;

  return (
    <div id="habits-goals" className="w-full scroll-mt-24 space-y-6 select-none">
      {/* 1. DAILY HABITS CHECKLIST */}
      <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-8 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#0a1b10]/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] font-mono text-xs font-bold shadow-[2px_2px_0px_#64DC4C] mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>[ RITUALS // SUSTAINABLE DEV BOUNDARIES ]</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
              Daily Dev Habits & Recovery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Low-friction micro-habits that protect your engineering focus and prevent screen burnout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                COMPLETED
              </span>
              <span className="text-lg font-black text-slate-900 font-display">
                {completedHabitsCount}/{habits.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowAddHabitModal(true);
              }}
              className="p-2.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 transition shadow-sm cursor-pointer flex items-center justify-center"
              title="Add Custom Habit"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
          <div
            style={{ width: `${habitCompletionRate}%` }}
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
          />
        </div>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {habits.map((habit) => {
            const isDone = habit.completed_today;
            return (
              <div
                key={habit.id}
                onClick={() => handleToggleHabit(habit.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isDone
                    ? "bg-emerald-50/60 border-emerald-200/80 shadow-2xs"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className={`text-xs sm:text-sm font-bold truncate ${
                        isDone ? "line-through text-slate-400" : "text-slate-800"
                      }`}
                    >
                      {habit.title}
                    </h4>
                    <span className="text-[11px] font-medium text-slate-400 block">
                      {habit.completions_last_30_days} days logged
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHabit(habit.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                  title="Remove habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DAILY SLEEP, WATER & SCREEN TIME LOGGER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 mb-2">
              <Moon className="w-3.5 h-3.5" />
              <span>Physical Baseline</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
              Sleep, Hydration & Screen Time
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Physical factors that directly influence your code clarity and burnout threshold.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveMetrics}
            disabled={savingMetrics}
            className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {savingMetrics ? "Saving..." : "Save Metrics"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sleep Hours & Quality */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-sky-600" /> Sleep
              </span>
              <span className="text-xs font-black text-sky-600">
                {todayMetrics.sleep_hours} hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={todayMetrics.sleep_hours}
              onChange={(e) =>
                setTodayMetrics({ ...todayMetrics, sleep_hours: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-sky-600 my-2"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
              <span className="text-[11px] font-semibold text-slate-500">Quality:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      sounds.playBlip(400 + star * 50);
                      setTodayMetrics({ ...todayMetrics, sleep_quality: star });
                    }}
                    className={`text-base cursor-pointer transition ${
                      todayMetrics.sleep_quality >= star ? "text-amber-400" : "text-slate-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-emerald-600" /> Hydration
              </span>
              <span className="text-xs font-black text-emerald-600">
                {todayMetrics.water_glasses} glasses
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 my-2">
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setTodayMetrics({
                    ...todayMetrics,
                    water_glasses: Math.max(0, todayMetrics.water_glasses - 1),
                  });
                }}
                className="w-8 h-8 rounded-full border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center transition"
              >
                -
              </button>
              <div className="flex gap-0.5 text-base">
                {"💧".repeat(Math.min(5, todayMetrics.water_glasses))}
                {todayMetrics.water_glasses === 0 && <span className="text-xs text-slate-400">Empty</span>}
              </div>
              <button
                type="button"
                onClick={() => {
                  sounds.playBlip(550);
                  setTodayMetrics({
                    ...todayMetrics,
                    water_glasses: todayMetrics.water_glasses + 1,
                  });
                }}
                className="w-8 h-8 rounded-full border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-center transition"
              >
                +
              </button>
            </div>
            <div className="text-[11px] font-medium text-slate-500 text-center mt-2 pt-2 border-t border-slate-200/60">
              {todayMetrics.water_glasses * 250} ml intake
            </div>
          </div>

          {/* Screen Time */}
          <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-indigo-600" /> Screen Time
              </span>
              <span className="text-xs font-black text-indigo-600">
                {todayMetrics.screen_time_hours} hrs
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.5"
              value={todayMetrics.screen_time_hours}
              onChange={(e) =>
                setTodayMetrics({ ...todayMetrics, screen_time_hours: parseFloat(e.target.value) })
              }
              className="w-full h-2 bg-slate-200 rounded appearance-none cursor-pointer accent-indigo-600 my-2"
            />
            <div className="text-[11px] font-medium text-slate-500 text-center mt-2 pt-2 border-t border-slate-200/60">
              Target &lt; 6h outside active coding
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL WELLNESS GOALS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/60 mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Milestone Goals</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">
              Personal Wellness Goals
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 font-medium">
              Healthy developer intentions. Advance milestone percentages as you make steady progress.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowAddGoalModal(true);
            }}
            className="px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-2 hover:bg-emerald-600 transition cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" /> Set Goal
          </button>
        </div>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                      {goal.title}
                      {goal.completed && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Achieved!
                        </span>
                      )}
                    </h4>
                    {goal.target_description && (
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">{goal.target_description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-indigo-600 font-display">
                      {goal.progress}%
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${goal.progress}%` }}
                    className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  />
                </div>

                {/* Quick Progress Buttons */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-1.5">
                    {[25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleUpdateGoalProgress(goal.id, val)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                          goal.progress === val
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>

                  {goal.target_date && (
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Target: {goal.target_date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
            No active goals yet. Click &apos;Set Goal&apos; to establish a supportive wellness target.
          </div>
        )}
      </div>

      {/* MODAL: ADD HABIT */}
      {showAddHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 font-display">
                Add Dev Micro-Ritual
              </h3>
              <button
                type="button"
                onClick={() => setShowAddHabitModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ritual Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15-minute IDE screen break, Ergonomic stretch..."
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="mindfulness">Mindfulness & Screen Breaks</option>
                  <option value="sleep">Sleep & Rest</option>
                  <option value="health">Hydration & Nutrition</option>
                  <option value="fitness">Posture & Physical Movement</option>
                  <option value="gratitude">Reflection & Calm</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabitModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer shadow-sm"
                >
                  Add Ritual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl border border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 font-display">
                Set Wellness Goal
              </h3>
              <button
                type="button"
                onClick={() => setShowAddGoalModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Disconnect by 9 PM, Take 3 breath breaks per sprint..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Why this intention supports your calm & clarity..."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition cursor-pointer shadow-sm"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HabitsAndGoals;
