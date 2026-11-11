import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import {
  Sparkles,
  Leaf,
  Sun,
  Moon,
  CloudRain,
  Heart,
  Droplets,
  Check,
  Trash2,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";

// 5 Rich Poetic Mood Archetypes (Creative & Artistic, Zero Generic Emojis)
export const MOOD_ARCHETYPES = [
  {
    id: "radiant",
    name: "Radiant Bloom",
    subtitle: "Joyful, energized & full of life",
    badge: "Bloom",
    accent: "from-amber-100/70 to-rose-100/70 border-amber-300 text-amber-900",
    pillActive: "bg-amber-600 text-white shadow-xs",
    defaultScore: 9,
    defaultEnergy: 5,
    defaultStress: 2,
    icon: Sparkles,
  },
  {
    id: "calm",
    name: "Quiet Sanctuary",
    subtitle: "Centered, peaceful & grounded",
    badge: "Sanctuary",
    accent: "from-emerald-100/70 to-teal-100/70 border-emerald-300 text-emerald-900",
    pillActive: "bg-[#2d6a4f] text-white shadow-xs",
    defaultScore: 8,
    defaultEnergy: 3,
    defaultStress: 2,
    icon: Leaf,
  },
  {
    id: "breezy",
    name: "Gentle Sunlight",
    subtitle: "Steady, present & clear-minded",
    badge: "Sunlight",
    accent: "from-sky-100/70 to-amber-100/70 border-sky-300 text-sky-900",
    pillActive: "bg-teal-700 text-white shadow-xs",
    defaultScore: 6,
    defaultEnergy: 3,
    defaultStress: 4,
    icon: Sun,
  },
  {
    id: "fatigued",
    name: "Soft Twilight",
    subtitle: "Low battery, quiet & winding down",
    badge: "Twilight",
    accent: "from-stone-100/70 to-slate-100/70 border-slate-300 text-slate-800",
    pillActive: "bg-slate-700 text-white shadow-xs",
    defaultScore: 4,
    defaultEnergy: 2,
    defaultStress: 5,
    icon: Moon,
  },
  {
    id: "stormy",
    name: "Passing Clouds",
    subtitle: "Tension, overloaded & untangling",
    badge: "Clouds",
    accent: "from-rose-100/70 to-purple-100/70 border-rose-300 text-rose-900",
    pillActive: "bg-rose-700 text-white shadow-xs",
    defaultScore: 2,
    defaultEnergy: 2,
    defaultStress: 8,
    icon: CloudRain,
  },
];

// Legacy compatibility export
export const EMOTIONS = MOOD_ARCHETYPES.map((a) => ({ name: a.name, label: a.name }));
export const COMMON_TRIGGERS = [];

const MoodTracker = ({ onMoodLogged }) => {
  const [selectedArchetypeId, setSelectedArchetypeId] = useState("calm");
  const [score, setScore] = useState(8);
  const [primaryEmotion, setPrimaryEmotion] = useState("Quiet Sanctuary");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  const activeArchetype = MOOD_ARCHETYPES.find((a) => a.id === selectedArchetypeId) || MOOD_ARCHETYPES[1];

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

  const handleSelectArchetype = (archetype) => {
    sounds.playClick();
    setSelectedArchetypeId(archetype.id);
    setPrimaryEmotion(archetype.name);
    setScore(archetype.defaultScore);
    setEnergyLevel(archetype.defaultEnergy);
    setStressLevel(archetype.defaultStress);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    sounds.playClick();

    try {
      await api.post("/api/moods", {
        score: parseInt(score, 10),
        primaryEmotion,
        energyLevel: parseInt(energyLevel, 10),
        stressLevel: parseInt(stressLevel, 10),
        triggers: [],
        notes: "",
      });

      sounds.playSuccess();
      toast.success("Mood check-in recorded! 🌸");
      fetchRecentLogs();
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not record check-in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this memory?")) return;
    try {
      sounds.playClick();
      await api.delete(`/api/moods/${id}`);
      toast.success("Memory removed.");
      setRecentLogs((prev) => prev.filter((l) => l.id !== id));
      if (onMoodLogged) onMoodLogged();
    } catch (err) {
      toast.error("Could not remove mood log.");
    }
  };

  return (
    <div id="mood-tracker" className="w-full scroll-mt-24 select-none pb-12">
      {/* =========================================================================
          HERO BANNER
         ========================================================================= */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif italic font-extrabold text-[#0a2e1c] tracking-tight drop-shadow-xs">
            A Moment on the Bench
          </h1>
          <p className="font-serif italic text-xs sm:text-sm text-[#1b4332]/85 mt-1">
            Listen to your breathing, calibrate your energy, and log your mood.
          </p>
        </div>

        {/* Live Emotional State Badge */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/75 backdrop-blur-md border border-white/80 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2d6a4f] animate-pulse"></span>
          <div className="text-left">
            <span className="text-[10px] font-serif italic text-[#1b4332]/70 uppercase tracking-wider block">
              Current Aura
            </span>
            <span className="text-xs font-serif italic font-bold text-[#0a2e1c]">
              {primaryEmotion} · {score}/10 Harmony
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          FOCUSED SINGLE CARD: Interactive Mood Check-in
         ========================================================================= */}
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
        <div className="bg-[#FCFAF7]/85 backdrop-blur-md rounded-3xl border-2 border-white/80 p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* 1. Emotional Weather Archetypes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif italic text-xs font-bold text-[#0a2e1c]">
                1. How is the weather in your mind?
              </span>
              <span className="font-serif italic text-[11px] text-[#2d6a4f]/70 font-semibold">
                Tap to calibrate
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
              {MOOD_ARCHETYPES.map((arch) => {
                const isSelected = selectedArchetypeId === arch.id;
                const IconComponent = arch.icon;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => handleSelectArchetype(arch)}
                    className={`group relative p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between gap-1.5 ${
                      isSelected
                        ? `bg-white/95 border-2 border-[#2d6a4f] shadow-md scale-[1.02]`
                        : `bg-white/60 hover:bg-white/90 border-white/70 hover:border-[#2d6a4f]/30 shadow-2xs`
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? `bg-[#2d6a4f] text-white shadow-xs`
                          : `bg-[#eaf5ed] text-[#2d6a4f] group-hover:scale-105`
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    <span
                      className={`font-serif italic text-xs leading-tight ${
                        isSelected ? "font-extrabold text-[#0a2e1c]" : "font-bold text-[#1b4332]"
                      }`}
                    >
                      {arch.badge}
                    </span>

                    <span className="text-[10px] font-serif italic text-[#1b4332]/60 line-clamp-1">
                      {arch.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Poetic description of active archetype */}
            <div className="px-3.5 py-2 rounded-xl bg-white/60 border border-white/60 flex items-center justify-between text-xs font-serif italic">
              <span className="text-[#0a2e1c] font-bold">
                {activeArchetype.name}:
              </span>
              <span className="text-[#2d6a4f] font-medium">
                &ldquo;{activeArchetype.subtitle}&rdquo;
              </span>
            </div>
          </div>

          {/* 2. Harmony & Clarity Scale (1 - 10) */}
          <div className="bg-white/75 border border-[#2d6a4f]/20 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-serif italic text-xs font-bold text-[#0a2e1c] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#2d6a4f]" /> Harmony &amp; Mental Clarity
              </span>
              <span className="font-serif italic text-xs font-bold px-2.5 py-0.5 rounded-lg bg-[#eaf5ed] text-[#0a2e1c] border border-[#2d6a4f]/25 shadow-2xs">
                {score} / 10
              </span>
            </div>

            <div className="relative pt-1">
              <input
                type="range"
                min="1"
                max="10"
                value={score}
                onChange={(e) => {
                  setScore(Number(e.target.value));
                  sounds.playPop(300 + Number(e.target.value) * 20);
                }}
                className="w-full h-2.5 bg-[#eaf5ed] rounded-full appearance-none cursor-pointer accent-[#2d6a4f]"
              />
            </div>

            <div className="flex justify-between text-[11px] font-serif italic text-[#1b4332]/70 font-medium">
              <span>Cloudy &amp; Tired</span>
              <span>Balanced Equilibrium</span>
              <span>Radiant Flow</span>
            </div>
          </div>

          {/* 3. Inner Stillness & Tension Scale */}
          <div className="bg-white/75 border border-[#2d6a4f]/20 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-serif italic text-xs font-bold text-[#0a2e1c] flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600" /> Inner Stillness &amp; Tension
              </span>
              <span className="font-serif italic text-xs font-bold px-2.5 py-0.5 rounded-lg bg-sky-50 text-[#0a2e1c] border border-sky-200">
                {stressLevel} / 10
              </span>
            </div>

            <div className="relative pt-1">
              <input
                type="range"
                min="1"
                max="10"
                value={stressLevel}
                onChange={(e) => {
                  sounds.playClick();
                  setStressLevel(Number(e.target.value));
                }}
                className="w-full h-2.5 bg-sky-100 rounded-full appearance-none cursor-pointer accent-sky-700"
              />
            </div>

            <div className="flex justify-between text-[11px] font-serif italic text-slate-500">
              <span>Placid Lake (Deep Peace · 1)</span>
              <span>Gentle Ripple (Moderate · 5)</span>
              <span>Restless Waves (High Tension · 10)</span>
            </div>
          </div>

          {/* Save Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2d6a4f] to-[#1b4332] hover:from-[#1b4332] hover:to-[#0f281e] text-white font-serif italic font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{isSubmitting ? "Preserving Check-in..." : "Save Mood Check-in"}</span>
          </button>
        </div>

        {/* Past Memories on the Bench */}
        {recentLogs.length > 0 && (
          <div className="bg-[#FCFAF7]/80 backdrop-blur-md rounded-3xl border-2 border-white/80 p-5 shadow-lg space-y-3">
            <span className="font-serif italic text-xs font-bold text-[#0a2e1c] block">
              Recent Check-in Records
            </span>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {recentLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-white/80 border border-white/80 shadow-2xs flex items-center justify-between hover:bg-white transition"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-serif italic text-xs font-bold text-[#0a2e1c] truncate">
                        {log.primary_emotion}
                      </span>
                      <span className="font-serif italic text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#eaf5ed] text-[#2d6a4f]">
                        {log.score}/10
                      </span>
                      <span className="text-[10px] font-serif italic text-slate-400">
                        {log.log_date}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(log.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0"
                    title="Remove memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default MoodTracker;
