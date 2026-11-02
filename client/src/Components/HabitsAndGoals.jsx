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
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { PixelFlame, PixelStar, PixelHeart } from "./PixelIcons";

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
        toast.success("Habit checked off! Consistency builds peace.", { icon: "🌱" });
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
        toast.success("New wellness habit created!");
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
      toast.success("Daily wellness metrics saved!", { icon: "💧" });
      if (onRefreshNeeded) onRefreshNeeded();
    } catch (err) {
      toast.error("Could not save wellness metrics.");
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
        toast.success("Personal wellness goal set!", { icon: "🎯" });
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
          toast.success("Milestone achieved! Celebrate your steady progress.", { icon: "🎉" });
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
    <div id="habits-goals" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 scroll-mt-24 space-y-8">
      {/* 1. DAILY HABITS CHECKLIST */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#18181B]/15">
          <div>
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#FFEAA7] text-[#18181B] text-[11px] mb-2 font-['Silkscreen']">
              <PixelFlame className="w-3.5 h-3.5" />
              MINDFUL RITUALS
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Daily Habits & Micro-Rituals
            </h2>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-1">
              Low-friction micro-habits that protect your baseline. Check in gently without shame.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/60 uppercase tracking-wider block">
                COMPLETED
              </span>
              <span className="text-base sm:text-lg font-black font-['Press_Start_2P'] text-[#18181B]">
                {completedHabitsCount}/{habits.length}
              </span>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                setShowAddHabitModal(true);
              }}
              className="pixel-btn pixel-btn-yellow p-2.5 text-[#18181B] cursor-pointer flex items-center justify-center"
              title="Add Custom Habit"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pixel Health Bar / XP Progress */}
        <div className="w-full bg-white h-4 rounded border-2 border-[#18181B] p-0.5 mb-6 shadow-[2px_2px_0px_#18181B]">
          <div
            style={{ width: `${habitCompletionRate}%` }}
            className="h-full bg-[#00B894] transition-all duration-500 rounded-sm"
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
                className={`p-3.5 rounded-lg border-2 border-[#18181B] transition-all cursor-pointer flex items-center justify-between ${
                  isDone
                    ? "bg-[#55EFC4]/40 shadow-[2px_2px_0px_#18181B]"
                    : "bg-white hover:bg-[#FAF8F5] shadow-[3px_3px_0px_#18181B]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded border-2 border-[#18181B] flex items-center justify-center transition-all ${
                      isDone ? "bg-[#00B894] text-white" : "bg-white"
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                  <div>
                    <h4
                      className={`text-xs sm:text-sm font-black font-['Bricolage_Grotesque'] ${
                        isDone ? "line-through text-[#18181B]/60" : "text-[#18181B]"
                      }`}
                    >
                      {habit.title}
                    </h4>
                    <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 block">
                      {habit.completions_last_30_days} DAYS LOGGED
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHabit(habit.id);
                  }}
                  className="p-1.5 text-[#18181B]/40 hover:text-[#D63031] transition cursor-pointer"
                  title="Remove habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DAILY SLEEP, WATER & WELLNESS METRICS LOGGER */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#18181B]/15">
          <div>
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#74B9FF] text-[#18181B] text-[11px] mb-2 font-['Silkscreen']">
              <Moon className="w-3.5 h-3.5" />
              PHYSICAL METRICS
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Daily Sleep, Hydration & Screen Time
            </h3>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-0.5">
              Physical factors that directly feed into the correlation engine.
            </p>
          </div>

          <button
            onClick={handleSaveMetrics}
            disabled={savingMetrics}
            className="pixel-btn pixel-btn-green px-5 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer disabled:opacity-50"
          >
            {savingMetrics ? "SAVING..." : "SAVE METRICS"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sleep Hours & Quality */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-['Silkscreen'] text-[#18181B] flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-[#0984E3]" /> SLEEP
              </span>
              <span className="text-xs font-['Press_Start_2P'] text-[#0984E3]">
                {todayMetrics.sleep_hours}h
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
              className="w-full h-2 bg-[#FAF8F5] border border-[#18181B] rounded appearance-none cursor-pointer accent-[#0984E3] my-2"
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#18181B]/15">
              <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/70">QUALITY:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      sounds.playBlip(400 + star * 50);
                      setTodayMetrics({ ...todayMetrics, sleep_quality: star });
                    }}
                    className={`text-base cursor-pointer ${
                      todayMetrics.sleep_quality >= star ? "text-[#F1C40F]" : "text-[#18181B]/20"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Water Intake */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-['Silkscreen'] text-[#18181B] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#00B894]" /> WATER
              </span>
              <span className="text-xs font-['Press_Start_2P'] text-[#00B894]">
                {todayMetrics.water_glasses}g
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
                className="w-8 h-8 rounded border-2 border-[#18181B] bg-white font-['Press_Start_2P'] text-xs text-[#18181B] hover:bg-[#FAF8F5] active:translate-x-0.5 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer flex items-center justify-center"
              >
                -
              </button>
              <div className="flex gap-0.5 text-base">
                {"💧".repeat(Math.min(5, todayMetrics.water_glasses))}
                {todayMetrics.water_glasses === 0 && <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/40">EMPTY</span>}
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
                className="w-8 h-8 rounded border-2 border-[#18181B] bg-white font-['Press_Start_2P'] text-xs text-[#18181B] hover:bg-[#FAF8F5] active:translate-x-0.5 active:translate-y-0.5 shadow-[1.5px_1.5px_0px_#18181B] cursor-pointer flex items-center justify-center"
              >
                +
              </button>
            </div>
            <div className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 text-center mt-2 pt-2 border-t border-[#18181B]/15">
              {todayMetrics.water_glasses * 250} ML HYDRATION
            </div>
          </div>

          {/* Screen Time */}
          <div className="bg-white p-4 rounded-xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-['Silkscreen'] text-[#18181B] flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#6C5CE7]" /> SCREEN
              </span>
              <span className="text-xs font-['Press_Start_2P'] text-[#6C5CE7]">
                {todayMetrics.screen_time_hours}h
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
              className="w-full h-2 bg-[#FAF8F5] border border-[#18181B] rounded appearance-none cursor-pointer accent-[#6C5CE7] my-2"
            />
            <div className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 text-center mt-2 pt-2 border-t border-[#18181B]/15">
              REDUCE BLUE LIGHT PRE-SLEEP
            </div>
          </div>
        </div>
      </div>

      {/* 3. PERSONAL WELLNESS GOALS */}
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#18181B]/15">
          <div>
            <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#D6A2E8] text-[#18181B] text-[11px] mb-2 font-['Silkscreen']">
              <Target className="w-3.5 h-3.5" />
              MILESTONE QUESTS
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Personal Wellness Quests
            </h3>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-0.5">
              Compassionate weekly intentions. Advance quest percentages as you go.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setShowAddGoalModal(true);
            }}
            className="pixel-btn pixel-btn-yellow px-4 py-2.5 text-xs font-black uppercase flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> SET QUEST
          </button>
        </div>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="p-4 sm:p-5 rounded-xl bg-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-black text-[#18181B] flex items-center gap-2 font-['Bricolage_Grotesque']">
                      {goal.title}
                      {goal.completed && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-['Silkscreen'] bg-[#55EFC4] text-[#18181B] border border-[#18181B]">
                          ACHIEVED!
                        </span>
                      )}
                    </h4>
                    {goal.target_description && (
                      <p className="text-xs text-[#18181B]/70 mt-0.5">{goal.target_description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-['Press_Start_2P'] text-[#0984E3]">
                      {goal.progress}%
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-[#18181B]/40 hover:text-[#D63031] transition cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#FAF8F5] h-3.5 rounded border-2 border-[#18181B] p-0.5 mb-3 shadow-[1.5px_1.5px_0px_#18181B]">
                  <div
                    style={{ width: `${goal.progress}%` }}
                    className="h-full bg-[#0984E3] rounded-xs transition-all duration-300"
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
                        className={`px-2.5 py-1 rounded text-[10px] font-['Silkscreen'] border-2 border-[#18181B] cursor-pointer transition ${
                          goal.progress === val
                            ? "bg-[#0984E3] text-white shadow-[1.5px_1.5px_0px_#18181B]"
                            : "bg-white text-[#18181B] hover:bg-[#FAF8F5]"
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>

                  {goal.target_date && (
                    <span className="text-[10px] font-['Silkscreen'] text-[#18181B]/50 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> TARGET: {goal.target_date}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs font-['Silkscreen'] text-[#18181B]/50 bg-white border-2 border-dashed border-[#18181B]/30 rounded-xl">
            NO ACTIVE QUESTS. CLICK 'SET QUEST' TO EMBARK ON A WELLNESS INTENTION.
          </div>
        )}
      </div>

      {/* MODAL: ADD HABIT */}
      {showAddHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/70 backdrop-blur-xs">
          <div className="pixel-card bg-[#FAF8F5] max-w-md w-full p-6 sm:p-7 shadow-[6px_6px_0px_#18181B]">
            <h3 className="text-xl font-black text-[#18181B] mb-4 font-['Bricolage_Grotesque']">
              Add Micro-Ritual
            </h3>
            <form onSubmit={handleCreateHabit} className="space-y-4">
              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  RITUAL TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. 15-minute afternoon walk, Read 10 pages..."
                  value={newHabitTitle}
                  onChange={(e) => setNewHabitTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  CATEGORY
                </label>
                <select
                  value={newHabitCategory}
                  onChange={(e) => setNewHabitCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                >
                  <option value="mindfulness">Mindfulness</option>
                  <option value="sleep">Sleep & Rest</option>
                  <option value="health">Hydration & Health</option>
                  <option value="fitness">Movement & Fitness</option>
                  <option value="gratitude">Gratitude & Reflection</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabitModal(false)}
                  className="pixel-btn px-4 py-2 text-xs font-black uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="pixel-btn pixel-btn-green px-5 py-2 text-xs font-black uppercase cursor-pointer"
                >
                  ADD RITUAL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GOAL */}
      {showAddGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#18181B]/70 backdrop-blur-xs">
          <div className="pixel-card bg-[#FAF8F5] max-w-md w-full p-6 sm:p-7 shadow-[6px_6px_0px_#18181B]">
            <h3 className="text-xl font-black text-[#18181B] mb-4 font-['Bricolage_Grotesque']">
              Set Wellness Quest
            </h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  QUEST TITLE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Meditate 4 times a week, Screen-free bedtime..."
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  DESCRIPTION (OPTIONAL)
                </label>
                <input
                  type="text"
                  placeholder="Why this intention matters to your peace..."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1">
                  TARGET DATE (OPTIONAL)
                </label>
                <input
                  type="date"
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded border-2 border-[#18181B] text-xs sm:text-sm bg-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoalModal(false)}
                  className="pixel-btn px-4 py-2 text-xs font-black uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="pixel-btn pixel-btn-yellow px-5 py-2 text-xs font-black uppercase cursor-pointer"
                >
                  SAVE QUEST
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
