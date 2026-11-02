import React, { useState, useEffect } from "react";
import {
  Wind,
  ShieldAlert,
  Clock,
  Heart,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  Code2,
  Check,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";
import assets from "../assets/asset";

const BREATHING_MODES = {
  box: {
    name: "Box Breathing",
    badge: "4-4-4-4 Pattern",
    desc: "Used by software engineers and high performers to regulate the nervous system after intense debugging.",
    steps: [
      { label: "Inhale", duration: 4, scale: "scale-110", hint: "Breathe in deeply through your nose...", color: "bg-sky-50 text-sky-700 border-sky-200" },
      { label: "Hold", duration: 4, scale: "scale-110", hint: "Hold with relaxed stillness in your chest...", color: "bg-amber-50 text-amber-700 border-amber-200" },
      { label: "Exhale", duration: 4, scale: "scale-90", hint: "Release slowly through your mouth...", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { label: "Hold", duration: 4, scale: "scale-90", hint: "Rest in the empty quiet space...", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    ],
  },
  relax: {
    name: "4-7-8 Deep Sleep & Decompress",
    badge: "4-7-8 Pattern",
    desc: "A natural nervous system sedative that triggers parasympathetic recovery after late-night coding.",
    steps: [
      { label: "Inhale", duration: 4, scale: "scale-110", hint: "Breathe in quietly through nose (4s)...", color: "bg-sky-50 text-sky-700 border-sky-200" },
      { label: "Hold", duration: 7, scale: "scale-110", hint: "Hold your breath gently and softly (7s)...", color: "bg-amber-50 text-amber-700 border-amber-200" },
      { label: "Exhale", duration: 8, scale: "scale-90", hint: "Exhale fully with a gentle whoosh sound (8s)...", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    ],
  },
};

const WellnessTools = ({ onJournalSaved }) => {
  const [activeTab, setActiveTab] = useState("breathing"); // 'breathing' | 'grounding' | 'timer' | 'gratitude'

  // 1. Breathing state
  const [breathingMode, setBreathingMode] = useState("box");
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  const currentModeConfig = BREATHING_MODES[breathingMode];
  const activeStep = currentModeConfig.steps[currentStepIndex];

  useEffect(() => {
    let interval = null;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setStepSecondsLeft((prev) => {
          if (prev <= 1) {
            sounds.playCalmTone(380, 0.25);
            setCurrentStepIndex((curIdx) => {
              const nextIdx = (curIdx + 1) % currentModeConfig.steps.length;
              if (nextIdx === 0) setCycleCount((c) => c + 1);
              return nextIdx;
            });
            const nextStepObj =
              currentModeConfig.steps[
                (currentStepIndex + 1) % currentModeConfig.steps.length
              ];
            return nextStepObj.duration;
          }
          if (prev <= 3) {
            sounds.playBlip(520, 0.04);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive, currentStepIndex, currentModeConfig]);

  const toggleBreathing = () => {
    sounds.playClick();
    if (!isBreathingActive) {
      setCurrentStepIndex(0);
      setStepSecondsLeft(currentModeConfig.steps[0].duration);
      sounds.playCalmTone(440, 0.3);
    }
    setIsBreathingActive(!isBreathingActive);
  };

  const resetBreathing = () => {
    sounds.playPop();
    setIsBreathingActive(false);
    setCurrentStepIndex(0);
    setStepSecondsLeft(currentModeConfig.steps[0].duration);
    setCycleCount(0);
  };

  // 2. 5-4-3-2-1 Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const groundingExercises = [
    {
      count: 5,
      sense: "See",
      tag: "5 Visual Details",
      instruction: "Look away from your screen. Notice 5 physical objects around your room.",
      example: "The shadow on your desk, the curve of a mug, sunlight through blinds, paper texture, leaves...",
      color: "bg-sky-50 text-sky-800 border-sky-200",
    },
    {
      count: 4,
      sense: "Feel",
      tag: "4 Tactile Sensations",
      instruction: "Notice 4 physical textures you can feel with your fingers or body right now.",
      example: "Your keyboard caps, feet resting against the floor, fabric of your shirt, cool air on your skin...",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      count: 3,
      sense: "Hear",
      tag: "3 Auditory Cues",
      instruction: "Listen closely for 3 ambient sounds around you outside your headphones.",
      example: "Laptop fan hum, distant bird or vehicle, your own calm breathing rhythm...",
      color: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      count: 2,
      sense: "Smell",
      tag: "2 Scents",
      instruction: "Identify 2 subtle aromas around you, or take a deep grounding breath of fresh air.",
      example: "Fresh coffee, fresh rain, sandalwood, or clean morning room air...",
      color: "bg-purple-50 text-purple-800 border-purple-200",
    },
    {
      count: 1,
      sense: "Taste",
      tag: "1 Taste",
      instruction: "Notice 1 lingering taste, or take a refreshing sip of water.",
      example: "A sip of cool water, tea, mint, or simple hydration...",
      color: "bg-rose-50 text-rose-800 border-rose-200",
    },
  ];

  // 3. Meditation Timer state
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
      toast.success("Meditation cycle complete! Mind refreshed.", { icon: "🧘" });
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

  // 4. Gratitude Jar state
  const [gratitude1, setGratitude1] = useState("");
  const [gratitude2, setGratitude2] = useState("");
  const [gratitude3, setGratitude3] = useState("");
  const [savingGratitude, setSavingGratitude] = useState(false);

  const saveGratitudeAsJournal = async () => {
    if (!gratitude1 && !gratitude2 && !gratitude3) {
      toast.error("Please jot down at least one item of gratitude!");
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
        stickers: ["Heart", "Blossom"],
      });
      sounds.playSuccess();
      toast.success("Gratitude preserved in your private journal!", { icon: "✨" });
      setGratitude1("");
      setGratitude2("");
      setGratitude3("");
      if (onJournalSaved) onJournalSaved();
    } catch (err) {
      toast.error("Could not save gratitude journal.");
    } finally {
      setSavingGratitude(false);
    }
  };

  return (
    <div id="wellness-tools" className="w-full scroll-mt-24 space-y-6 select-none">
      <div className="bg-[#FCFAF4] rounded-2xl p-6 sm:p-8 border-2 border-[#0a1b10] shadow-[4px_4px_0px_0px_#0a1b10]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-[#0a1b10]/15">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0a1b10] text-[#64DC4C] border-2 border-[#0a1b10] font-mono text-xs font-bold shadow-[2px_2px_0px_#64DC4C] mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>[ PROTOCOLS // 60s MICRO-RECOVERY ]</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0a1b10] tracking-tight font-display">
              Stress Management &amp; Grounding Tools
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 font-bold mt-1">
              Interactive neuro-grounding exercises to calm sprint anxiety, recover cognitive bandwidth, and prevent burnout.
            </p>
          </div>
        </div>

        {/* Retro Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 bg-white border-2 border-[#0a1b10] p-1.5 rounded-xl shadow-[2px_2px_0px_#0a1b10]">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("breathing");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-mono font-black transition-all cursor-pointer ${
              activeTab === "breathing"
                ? "bg-[#0a1b10] text-[#64DC4C] shadow-[2px_2px_0px_#64DC4C]"
                : "text-slate-700 hover:bg-[#EBF7E9]"
            }`}
          >
            <Wind className="w-4 h-4 text-emerald-600" />
            <span>Breath Pacer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("grounding");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "grounding"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-sky-600" />
            <span>5-4-3-2-1 Ground</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("timer");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "timer"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Meditation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setActiveTab("gratitude");
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === "gratitude"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Gratitude Jar</span>
          </button>
        </div>

        {/* TAB 1: BREATHING PACER */}
        {activeTab === "breathing" && (
          <div className="flex flex-col items-center text-center py-4">
            {/* Mode Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setBreathingMode("box");
                  resetBreathing();
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  breathingMode === "box"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Box Breathing (4-4-4-4)
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setBreathingMode("relax");
                  resetBreathing();
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer ${
                  breathingMode === "relax"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                4-7-8 Sleep & Decompress
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 mb-8 max-w-md font-medium">
              {currentModeConfig.desc}
            </p>

            {/* Smooth Breathing Aura Visualizer */}
            <div className="relative w-64 h-64 flex items-center justify-center my-4">
              {/* Outer Pulsing Ring */}
              <div
                className={`absolute inset-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 transition-all duration-1000 ${
                  isBreathingActive ? activeStep.scale : "scale-100"
                }`}
              />

              {/* Central Circle */}
              <div
                className={`w-48 h-48 rounded-full bg-white border border-slate-200/80 shadow-lg flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out ${
                  isBreathingActive ? activeStep.scale : "scale-100"
                }`}
              >
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${
                    isBreathingActive ? activeStep.color : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {isBreathingActive ? activeStep.label : "Ready"}
                </div>

                <span className="text-5xl font-black text-slate-900 font-display tracking-tight my-1">
                  {isBreathingActive ? stepSecondsLeft : "00"}
                </span>

                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mt-1">
                  <span>{isBreathingActive ? `Cycle ${cycleCount + 1}` : "Press Start"}</span>
                </div>
              </div>
            </div>

            {/* Live Instruction Banner */}
            <div className="bg-slate-50 border border-slate-200/70 px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-slate-700 my-4 min-h-[46px] flex items-center justify-center max-w-md">
              {isBreathingActive ? activeStep.hint : "Sit comfortably, release shoulder tension, and click Start Pacer."}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={toggleBreathing}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-sm cursor-pointer"
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Start Pacer
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetBreathing}
                className="p-3 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Reset Cycle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Sanctuary Companion */}
            <div className="mt-8 flex items-center justify-center gap-4 bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl max-w-sm">
              <img
                src={breathingMode === "relax" ? assets.bed_burrito : assets.space_cat}
                alt="Breathing Companion"
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
              />
              <div className="text-left">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {breathingMode === "relax" ? "Duvet Burrito Mode" : "Cosmic Peace"}
                </span>
                <p className="text-xs text-slate-600 font-medium leading-tight">
                  {breathingMode === "relax"
                    ? "Warm blanket & soothing breath before sleep."
                    : "Floating in calm headspace away from git conflicts."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 5-4-3-2-1 GROUNDING TECHNIQUE */}
        {activeTab === "grounding" && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto mb-4">
              <span className="text-xs font-bold text-emerald-700 block mb-1">
                Neuro-Sensory Anchor
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                5-4-3-2-1 Grounding Protocol
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                When sprint deadlines or production bugs trigger anxiety, grounding through sensory channels halts runaway mental adrenaline.
              </p>
            </div>

            {/* 5 Stepped Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {groundingExercises.map((step, idx) => {
                const isCurrent = idx === groundingStep;
                const isPassed = idx < groundingStep;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setGroundingStep(idx);
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                        : isPassed
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200/60"
                        : "bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold mb-1">
                      {isPassed ? <Check className="w-4 h-4 text-emerald-600" /> : step.count}
                    </div>
                    <span className="text-[11px] font-bold block uppercase tracking-wider">
                      {step.sense}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Grounding Inspection Box */}
            <div className="bg-slate-50/70 border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-center max-w-xl mx-auto shadow-xs">
              <div
                className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border mb-3 ${groundingExercises[groundingStep].color}`}
              >
                Step {groundingStep + 1} of 5: {groundingExercises[groundingStep].tag}
              </div>

              <h4 className="text-lg sm:text-xl font-black text-slate-900 mb-2 font-display">
                {groundingExercises[groundingStep].instruction}
              </h4>

              <div className="bg-white border border-slate-200/70 p-3.5 rounded-2xl text-xs text-slate-600 italic max-w-md mx-auto mb-6 font-medium">
                &ldquo;{groundingExercises[groundingStep].example}&rdquo;
              </div>

              <div className="flex items-center justify-center gap-3">
                {groundingStep > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      setGroundingStep((s) => s - 1);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    Previous
                  </button>
                )}

                {groundingStep < groundingExercises.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setGroundingStep((s) => s + 1);
                    }}
                    className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>I Noticed Them</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playSuccess();
                      toast.success("Grounding exercise completed! You are centered.", { icon: "🌿" });
                      setGroundingStep(0);
                    }}
                    className="px-5 py-2.5 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Session</span>
                  </button>
                )}
              </div>

              {/* Grounding Companion Card */}
              <div className="flex items-center justify-center gap-4 bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl max-w-sm mx-auto mt-4">
                <img
                  src={assets.cape_cat}
                  alt="Delulu But Determined"
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
                />
                <div className="text-left">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Delulu But Determined
                  </span>
                  <p className="text-xs text-slate-600 font-medium leading-tight">
                    You&apos;ve survived 100% of bad production bugs. You will conquer this too.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDITATION TIMER */}
        {activeTab === "timer" && (
          <div className="flex flex-col items-center text-center py-4">
            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { label: "2m Quick Reset", sec: 120 },
                { label: "5m Focus Breather", sec: 300 },
                { label: "10m Deep Reset", sec: 600 },
                { label: "15m Recharge", sec: 900 },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  type="button"
                  onClick={() => selectTimerDuration(preset.sec)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                    timerDuration === preset.sec
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Modern Minimal Dial */}
            <div className="relative w-64 h-52 rounded-3xl bg-slate-50/70 border border-slate-200/80 flex flex-col items-center justify-center shadow-xs p-6 my-2">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-slate-400">
                  {isTimerRunning ? "Meditation In Progress" : "Ready for Awareness"}
                </span>
              </div>

              <span className="text-5xl font-black text-slate-900 font-display tracking-tight my-1">
                {formatTimer(timerSecondsLeft)}
              </span>

              <div className="flex items-center gap-1.5 mt-3">
                <div className={`w-2 h-2 rounded-full ${isTimerRunning ? "bg-emerald-500 animate-ping" : "bg-slate-300"}`} />
                <span className="text-xs font-medium text-slate-500">
                  {isTimerRunning ? "Soft, natural breathing" : "Click Start"}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 max-w-sm mt-3 mb-6 font-medium">
              Lower your shoulders, release eye strain from the monitor, and follow your breath naturally.
            </p>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-sm cursor-pointer"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Start Meditation
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  setIsTimerRunning(false);
                  setTimerSecondsLeft(timerDuration);
                }}
                className="p-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Stretch Companion */}
            <div className="mt-8 flex items-center justify-center gap-4 bg-slate-50 border border-slate-200/70 p-3.5 rounded-2xl max-w-sm">
              <img
                src={assets.cat_yawn}
                alt="Playful Stretch"
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200 shadow-2xs"
              />
              <div className="text-left">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  Stretch &amp; Yawn Break
                </span>
                <p className="text-xs text-slate-600 font-medium leading-tight">
                  Unclench your jaw, drop your shoulders, and rest your eyes from blue light.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GRATITUDE JAR */}
        {activeTab === "gratitude" && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60 mb-2">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                <span>Daily 3 Gratitudes</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Gratitude Deposit Vault
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Jot down three small, concrete moments that brought warmth or relief outside work today.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  1. A person, peer or kind interaction:
                </label>
                <input
                  type="text"
                  placeholder="e.g. A supportive code review, kind message from a teammate..."
                  value={gratitude1}
                  onChange={(e) => setGratitude1(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  2. A sensory comfort or restful detail:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warm cup of tea, calm morning walk, comfortable chair..."
                  value={gratitude2}
                  onChange={(e) => setGratitude2(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>

              <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/70">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  3. A personal boundary or effort I am proud of:
                </label>
                <input
                  type="text"
                  placeholder="e.g. I stepped away from my laptop on time and respected my evening..."
                  value={gratitude3}
                  onChange={(e) => setGratitude3(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={saveGratitudeAsJournal}
              disabled={savingGratitude}
              className="w-full py-3 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-emerald-600 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{savingGratitude ? "Saving to Journal..." : "Deposit to Gratitude Journal"}</span>
            </button>

            {/* Love Letter Companion */}
            <div className="flex items-center justify-center gap-4 bg-rose-50/60 border border-rose-200/70 p-3.5 rounded-2xl">
              <img
                src={assets.pixel_letter}
                alt="Love Letter to Developers"
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-rose-200 shadow-2xs"
              />
              <div className="text-left">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Developer Self-Compassion
                </span>
                <p className="text-xs text-slate-600 font-medium leading-tight">
                  Your human worth is independent of story points, sprint velocity, or git commit streaks.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessTools;
