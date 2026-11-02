import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Zap,
  Activity,
  Trash2,
  Sparkles,
  PlusCircle,
  Code2,
  Clock,
  Heart,
  Terminal,
  Smile,
  ShieldCheck,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";

export const EMOTIONS = [
  { name: "Joyful", emoji: "😄", bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  { name: "Calm", emoji: "😌", bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  { name: "Grateful", emoji: "🥰", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  { name: "Energetic", emoji: "⚡", bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  { name: "Neutral", emoji: "😐", bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
  { name: "Anxious", emoji: "😰", bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  { name: "Sad", emoji: "😔", bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200" },
  { name: "Overwhelmed", emoji: "🤯", bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  { name: "Angry", emoji: "😡", bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
  { name: "Tired", emoji: "😴", bg: "bg-slate-100", text: "text-slate-800", border: "border-slate-200" },
];

export const COMMON_TRIGGERS = [
  "Late-Night Debugging",
  "Sprint Deadlines",
  "Broken Builds / CI/CD",
  "Context Switching",
  "PR & Code Reviews",
  "Merge Conflicts",
  "Imposter Syndrome",
  "On-Call Alert Fatigue",
  "Flow State Reached",
  "Screen Exhaustion",
  "Sleep Deprivation",
  "Physical Movement",
  "Quiet Solitude",
  "Work & Life Balance",
];

const MoodTracker = ({ onMoodLogged }) => {
  const [score, setScore] = useState(7);
  const [primaryEmotion, setPrimaryEmotion] = useState("Calm");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  const fetchRecentLogs = async () => {
    try {
      const res = await api.get("/api/moods?limit=10");
      if (res.data?.logs) {
        setRecentLogs(res.data.logs);
      }
    } catch (err) {
      console.warn("Could not fetch mood logs:", err?.message);
    }
  };

  useEffect(() => {
    fetchRecentLogs();
  }, []);

  const handleSliderChange = (newVal) => {
    setScore(newVal);
    sounds.playClick();
  };

  const toggleTrigger = (trigger) => {
    sounds.playClick();
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter((t) => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleSelectEmotion = (name) => {
    sounds.playClick();
    setPrimaryEmotion(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!primaryEmotion) {
      toast.error("Please pick a primary emotion.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/api/moods", {
        score: parseInt(score, 10),
        primaryEmotion,
        energyLevel: parseInt(energyLevel, 10),
        stressLevel: parseInt(stressLevel, 10),
        triggers: selectedTriggers,
        notes: notes.trim(),
      });

      sounds.playSuccess();
      toast.success("Developer baseline recorded in private sanctuary! 🌿");
      setNotes("");
      setSelectedTriggers([]);
      fetchRecentLogs();
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not record check-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this check-in?")) return;
    try {
      sounds.playClick();
      await api.delete(`/api/moods/${id}`);
      toast.success("Check-in removed.");
      setRecentLogs((prev) => prev.filter((l) => l.id !== id));
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      toast.error("Could not remove mood log.");
    }
  };

  const activeEmotionObj = EMOTIONS.find((e) => e.name === primaryEmotion) || EMOTIONS[1];

  return (
    <div id="mood-tracker" className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-8 scroll-mt-24">
      <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>Calm Me · Developer Baseline Check-In</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Calibrate Your Emotional Weather
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Drag the baseline slider to record your cognitive state. Notice your tension without self-judgment.
            </p>
          </div>

          {/* Current State Summary Pill */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-2xs">
            <span className="text-3xl">{activeEmotionObj.emoji}</span>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                CURRENT BASELINE
              </span>
              <span className="text-sm font-extrabold text-slate-900 font-display">
                {score <= 3 ? "Code Fatigue" : score <= 6 ? "Steady Flow" : "Radiant Flow"} ({score}/10)
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Mood Slider (1 - 10) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Cognitive & Emotional Comfort ({score}/10)
              </label>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border shadow-2xs ${
                  score >= 7
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : score >= 4
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}
              >
                {score} / 10
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              value={score}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2">
              <span>1 (Code Fatigue)</span>
              <span>5 (Balanced Baseline)</span>
              <span>10 (Peak Flow State)</span>
            </div>
          </div>

          {/* 2. Primary Emotion */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              2. Select Primary Emotion
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {EMOTIONS.map((emo) => {
                const isSelected = primaryEmotion === emo.name;
                return (
                  <button
                    type="button"
                    key={emo.name}
                    onClick={() => handleSelectEmotion(emo.name)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm scale-[1.02]"
                        : "bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{emo.emoji}</span>
                    <span className="font-display font-bold">{emo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Energy & Stress Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Energy */}
            <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-600" /> Cognitive Energy Level
                </span>
                <span className="text-xs font-extrabold text-amber-900">{energyLevel}/5</span>
              </div>
              <div className="flex gap-2 mt-3">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() => {
                      sounds.playClick();
                      setEnergyLevel(level);
                    }}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      energyLevel >= level
                        ? "bg-amber-400 border-amber-400 text-slate-900 shadow-2xs font-extrabold"
                        : "bg-white text-slate-400 border-amber-200/60 hover:bg-amber-100/50"
                    }`}
                  >
                    ⚡{level}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-rose-600" /> Sprint Strain / Tension
                </span>
                <span className="text-xs font-extrabold text-rose-900">{stressLevel}/10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => {
                  sounds.playClick();
                  setStressLevel(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-600 mt-2"
              />
              <div className="flex justify-between text-[10px] font-semibold text-rose-700/70 mt-1">
                <span>Peaceful (1)</span>
                <span>Moderate (5)</span>
                <span>Critical Tension (10)</span>
              </div>
            </div>
          </div>

          {/* 4. Trigger Tracking */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              4. Developer Influences & Stress Triggers
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TRIGGERS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <button
                    type="button"
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300"
                    }`}
                  >
                    #{trigger}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              5. Quick Reflection Note (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Stepped away from terminal, finished PR review, took a 10m walk..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 text-xs sm:text-sm font-medium focus:outline-none focus:bg-white focus:border-slate-400 transition"
            />
          </div>

          {/* Sleek Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? "Logging Dev Baseline..." : "Save Developer Baseline"}</span>
          </button>
        </form>

        {/* Recent Logs Stream */}
        {recentLogs.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Recent Baseline Records
            </h3>
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log) => {
                const emotionObj = EMOTIONS.find((e) => e.name === log.primary_emotion) || { emoji: "🌿", bg: "bg-emerald-50" };
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/70 flex items-center justify-between hover:bg-white hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-xl shadow-2xs">
                        {emotionObj.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-sm text-slate-900">
                            {log.primary_emotion}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              log.score >= 7
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : log.score >= 4
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-rose-50 text-rose-800 border-rose-200"
                            }`}
                          >
                            {log.score}/10
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {log.log_date} at {log.log_time}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-1">
                            &ldquo;{log.notes}&rdquo;
                          </p>
                        )}
                        {log.triggers && log.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {log.triggers.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold bg-white border border-slate-200/80 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(log.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
