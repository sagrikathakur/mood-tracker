import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";

const WellnessTools = ({ onJournalSaved }) => {
  const [activeTab, setActiveTab] = useState("timer"); // 'timer' | 'gratitude'

  // 1. Meditation Timer state
  const [timerDuration, setTimerDuration] = useState(300); // 5 mins in seconds
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let tInterval = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      tInterval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sounds.playSuccess();
      toast.success("Meditation complete. Mind refreshed.");
    }
    return () => clearInterval(tInterval);
  }, [isTimerRunning, timerSecondsLeft]);

  const selectTimerDuration = (seconds) => {
    sounds.playClick();
    setIsTimerRunning(false);
    setTimerDuration(seconds);
    setTimerSecondsLeft(seconds);
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 2. Gratitude state
  const [gratitude1, setGratitude1] = useState("");
  const [gratitude2, setGratitude2] = useState("");
  const [gratitude3, setGratitude3] = useState("");
  const [savingGratitude, setSavingGratitude] = useState(false);

  const saveGratitudeAsJournal = async () => {
    if (!gratitude1 && !gratitude2 && !gratitude3) {
      toast.error("Please enter at least one thought.");
      return;
    }
    sounds.playClick();
    setSavingGratitude(true);
    try {
      const content = `[GRATITUDE JOURNAL]\n\n1. ${gratitude1 || "—"}\n2. ${gratitude2 || "—"}\n3. ${gratitude3 || "—"}`;
      await api.post("/api/journal", {
        mood: "Grateful",
        content,
        tags: ["Gratitude", "Mindfulness"],
      });
      sounds.playSuccess();
      toast.success("Saved to private journal.");
      setGratitude1("");
      setGratitude2("");
      setGratitude3("");
      if (onJournalSaved) onJournalSaved();
    } catch (err) {
      toast.error("Could not save journal entry.");
    } finally {
      setSavingGratitude(false);
    }
  };

  return (
    <div id="wellness-tools" className="w-full max-w-xl mx-auto select-none py-2">
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 sm:p-8 shadow-xs">
        {/* Minimal Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200/60">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("timer");
              }}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "timer"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Meditation
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab("gratitude");
              }}
              className={`px-5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "gratitude"
                  ? "bg-white text-stone-900 shadow-2xs"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Gratitude
            </button>
          </div>
        </div>

        {/* TAB 1: MEDITATION TIMER */}
        {activeTab === "timer" && (
          <div className="flex flex-col items-center text-center">
            {/* Presets */}
            <div className="flex items-center gap-1.5 mb-8">
              {[
                { label: "2 min", sec: 120 },
                { label: "5 min", sec: 300 },
                { label: "10 min", sec: 600 },
                { label: "15 min", sec: 900 },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  type="button"
                  onClick={() => selectTimerDuration(preset.sec)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    timerDuration === preset.sec
                      ? "bg-stone-900 text-white"
                      : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Typography-focused Timer */}
            <div className="my-6">
              <span className="text-6xl sm:text-7xl font-extralight text-stone-900 tracking-tight font-mono select-none block">
                {formatTimer(timerSecondsLeft)}
              </span>
              <p className="text-xs text-stone-400 font-medium mt-3">
                {isTimerRunning ? "Rest your eyes, breathe naturally" : "Select duration and press start"}
              </p>
            </div>

            {/* Clean Controls */}
            <div className="flex items-center justify-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="px-7 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer shadow-2xs"
              >
                {isTimerRunning ? "Pause" : "Start"}
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsTimerRunning(false);
                  setTimerSecondsLeft(timerDuration);
                }}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: GRATITUDE */}
        {activeTab === "gratitude" && (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <h3 className="text-base font-semibold text-stone-900">
                Daily Reflections
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Take a moment to record small, grounded highlights from your day.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="1. A positive interaction or teammate support..."
                value={gratitude1}
                onChange={(e) => setGratitude1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
              />
              <input
                type="text"
                placeholder="2. A sensory comfort, quiet pause, or break..."
                value={gratitude2}
                onChange={(e) => setGratitude2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
              />
              <input
                type="text"
                placeholder="3. A personal boundary or effort you appreciate..."
                value={gratitude3}
                onChange={(e) => setGratitude3(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white transition"
              />
            </div>

            <button
              type="button"
              onClick={saveGratitudeAsJournal}
              disabled={savingGratitude}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition cursor-pointer disabled:opacity-50 shadow-2xs mt-2"
            >
              {savingGratitude ? "Saving..." : "Save to Journal"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessTools;
