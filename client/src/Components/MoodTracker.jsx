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
    <div id="mood-tracker" className="w-full scroll-mt-24 select-none">
      <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-9 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10] space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-[#0a1b10]/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] font-mono text-xs font-bold shadow-[2px_2px_0px_#64DC4C] mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>[ TELEMETRY // BASELINE CALIBRATION ]</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-[#0a1b10] tracking-tight">
              Calibrate Your Emotional Weather
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-0.5">
              Drag the baseline slider to record cognitive tension, fatigue, and sprint flow.
            </p>
          </div>

          {/* Current State Summary Pill (Retro Cartridge) */}
          <div className="flex items-center gap-3 bg-white border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] px-4 py-2.5 rounded-xl">
            <span className="text-3xl">{activeEmotionObj.emoji}</span>
            <div className="text-left">
              <span className="text-[10px] font-mono font-black text-slate-600 uppercase tracking-wider block">
                CURRENT BASELINE
              </span>
              <span className="text-sm font-black text-slate-950 font-display">
                {score <= 3 ? "Code Fatigue" : score <= 6 ? "Steady Flow" : "Radiant Flow"} ({score}/10)
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Mood Slider (1 - 10) */}
          <div className="p-5 sm:p-6 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono font-black text-[#0a1b10] uppercase tracking-wider">
                1. COGNITIVE &amp; EMOTIONAL COMFORT ({score}/10)
              </label>
              <span
                className={`text-xs font-mono font-black px-3 py-1 rounded-lg border-2 border-[#0a1b10] shadow-[2px_2px_0px_#0a1b10] ${
                  score >= 7
                    ? "bg-[#90D786] text-[#0a1b10]"
                    : score >= 4
                    ? "bg-amber-200 text-amber-950"
                    : "bg-rose-200 text-rose-950"
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
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0a1b10]"
            />
            <div className="flex justify-between text-xs font-mono font-bold text-slate-600 mt-2">
              <span>01 (Code Fatigue)</span>
              <span>05 (Balanced)</span>
              <span>10 (Peak Flow)</span>
            </div>
          </div>

          {/* 2. Primary Emotion */}
          <div>
            <label className="text-xs font-mono font-black text-[#0a1b10] uppercase tracking-wider block mb-3">
              2. SELECT PRIMARY EMOTION
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {EMOTIONS.map((emo) => {
                const isSelected = primaryEmotion === emo.name;
                return (
                  <button
                    type="button"
                    key={emo.name}
                    onClick={() => handleSelectEmotion(emo.name)}
                    className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 border-[#0a1b10] text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0a1b10] text-[#64DC4C] shadow-[3px_3px_0px_#64DC4C] translate-x-[1px] translate-y-[1px] font-black"
                        : "bg-white text-slate-900 shadow-[2px_2px_0px_#0a1b10] hover:bg-[#EBF7E9] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    }`}
                  >
                    <span className="text-xl">{emo.emoji}</span>
                    <span className="font-display font-extrabold">{emo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Energy & Stress Levels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Energy */}
            <div className="bg-white p-5 rounded-xl border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-black text-[#0a1b10] flex items-center gap-1.5 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-600" /> ENERGY LEVEL
                </span>
                <span className="text-xs font-mono font-black text-[#0a1b10] bg-amber-100 border border-[#0a1b10] px-2 py-0.5 rounded-md">
                  {energyLevel}/5
                </span>
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
                    className={`flex-1 py-2 rounded-lg border-2 border-[#0a1b10] text-xs font-black transition cursor-pointer ${
                      energyLevel >= level
                        ? "bg-amber-400 text-slate-950 shadow-[2px_2px_0px_#0a1b10]"
                        : "bg-white text-slate-600 hover:bg-amber-100/50 shadow-[1px_1px_0px_#0a1b10]"
                    }`}
                  >
                    ⚡{level}
                  </button>
                ))}
              </div>
            </div>

            {/* Stress */}
            <div className="bg-white p-5 rounded-xl border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-black text-[#0a1b10] flex items-center gap-1.5 uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-rose-600" /> SPRINT STRAIN / TENSION
                </span>
                <span className="text-xs font-mono font-black text-[#0a1b10] bg-rose-100 border border-[#0a1b10] px-2 py-0.5 rounded-md">
                  {stressLevel}/10
                </span>
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
                className="w-full h-3 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-[#0a1b10] mt-2"
              />
              <div className="flex justify-between text-[11px] font-mono font-bold text-slate-600 mt-1">
                <span>Peaceful (1)</span>
                <span>Moderate (5)</span>
                <span>Critical (10)</span>
              </div>
            </div>
          </div>

          {/* 4. Trigger Tracking */}
          <div>
            <label className="text-xs font-mono font-black text-[#0a1b10] uppercase tracking-wider block mb-2.5">
              4. DEVELOPER INFLUENCES &amp; TRIGGERS
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_TRIGGERS.map((trigger) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <button
                    type="button"
                    key={trigger}
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 border-[#0a1b10] transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C] font-black"
                        : "bg-white text-slate-800 shadow-[1px_1px_0px_#0a1b10] hover:bg-[#EBF7E9]"
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
            <label className="text-xs font-mono font-black text-[#0a1b10] uppercase tracking-wider block mb-2">
              5. QUICK REFLECTION NOTE (OPTIONAL)
            </label>
            <input
              type="text"
              placeholder="e.g. Stepped away from terminal, finished PR review, took a 10m walk..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-[#0a1b10] bg-white text-slate-900 text-xs sm:text-sm font-bold shadow-[2px_2px_0px_#0a1b10] focus:outline-none focus:shadow-[4px_4px_0px_#0a1b10] transition-all"
            />
          </div>

          {/* Retro Arcade Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl bg-[#0a1b10] hover:bg-black text-[#64DC4C] font-mono font-black text-sm sm:text-base border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#64DC4C] hover:shadow-[5px_5px_0px_0px_#64DC4C] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlusCircle className="w-5 h-5 text-[#64DC4C]" />
            <span>
              {isSubmitting ? "SAVING TO VAULT..." : "SAVE DEVELOPER BASELINE [ ENTER ]"}
            </span>
          </button>
        </form>

        {/* Recent Logs Stream */}
        {recentLogs.length > 0 && (
          <div className="pt-6 border-t-2 border-[#0a1b10]/15">
            <h3 className="text-xs font-mono font-black text-[#0a1b10] uppercase tracking-wider mb-4">
              [ ARCHIVED BASELINE RECORDS ]
            </h3>
            <div className="space-y-3">
              {recentLogs.slice(0, 5).map((log) => {
                const emotionObj = EMOTIONS.find((e) => e.name === log.primary_emotion) || { emoji: "🌿", bg: "bg-emerald-50" };
                return (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-white border-2 border-[#0a1b10] shadow-[3px_3px_0px_#0a1b10] flex items-center justify-between hover:bg-[#EBF7E9] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#FCFAF4] border-2 border-[#0a1b10] flex items-center justify-center text-xl shadow-[1px_1px_0px_#0a1b10] shrink-0">
                        {emotionObj.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm text-slate-950">
                            {log.primary_emotion}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border-2 border-[#0a1b10] shadow-[1px_1px_0px_#0a1b10] ${
                              log.score >= 7
                                ? "bg-[#90D786] text-[#0a1b10]"
                                : log.score >= 4
                                ? "bg-amber-200 text-amber-950"
                                : "bg-rose-200 text-rose-950"
                            }`}
                          >
                            {log.score}/10
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-500">
                            {log.log_date} at {log.log_time}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-xs text-slate-700 font-bold mt-1 line-clamp-1">
                            &ldquo;{log.notes}&rdquo;
                          </p>
                        )}
                        {log.triggers && log.triggers.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {log.triggers.map((t, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-mono font-bold bg-[#FCFAF4] border border-[#0a1b10] text-[#0a1b10] px-2 py-0.5 rounded-md"
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
                      className="p-2 rounded-lg border-2 border-[#0a1b10] bg-white text-slate-500 hover:text-rose-700 hover:bg-rose-50 shadow-[1px_1px_0px_#0a1b10] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
