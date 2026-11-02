import React, { useState, useEffect, useRef } from "react";
import {
  Wind,
  ShieldAlert,
  Clock,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Sparkle,
  Volume2,
  Check,
} from "lucide-react";
import api from "../utils/api";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";
import { PixelHeart, PixelStar, PixelFlame } from "./PixelIcons";

const BREATHING_MODES = {
  box: {
    name: "Box Breathing",
    badge: "4-4-4-4 PATTERN",
    desc: "Used by elite performers to deactivate fight-or-flight and achieve peak calm.",
    steps: [
      { label: "INHALE", duration: 4, scale: "scale-115", hint: "Breathe in deeply through nose...", color: "bg-[#74B9FF] text-[#0984E3]" },
      { label: "HOLD", duration: 4, scale: "scale-115", hint: "Keep stillness with lungs gently full...", color: "bg-[#FFEAA7] text-[#D63031]" },
      { label: "EXHALE", duration: 4, scale: "scale-90", hint: "Release slowly through mouth...", color: "bg-[#55EFC4] text-[#00B894]" },
      { label: "HOLD", duration: 4, scale: "scale-90", hint: "Rest in the empty quiet space...", color: "bg-[#A29BFE] text-[#6C5CE7]" },
    ],
  },
  relax: {
    name: "4-7-8 Deep Sleep",
    badge: "4-7-8 PATTERN",
    desc: "A natural nervous system sedative that triggers rapid parasympathetic relaxation.",
    steps: [
      { label: "INHALE", duration: 4, scale: "scale-115", hint: "Breathe in quietly through nose (4s)...", color: "bg-[#74B9FF] text-[#0984E3]" },
      { label: "HOLD", duration: 7, scale: "scale-115", hint: "Hold your breath gently and softly (7s)...", color: "bg-[#FFEAA7] text-[#D63031]" },
      { label: "EXHALE", duration: 8, scale: "scale-90", hint: "Exhale fully with a whoosh sound (8s)...", color: "bg-[#55EFC4] text-[#00B894]" },
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
            // Next step transition sound
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
          // gentle tick blip
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
      sense: "SEE",
      tag: "5 VISUAL DETAILS",
      instruction: "Look around you and observe 5 distinct things you can see.",
      example: "A sliver of shadow on the wall, the rim of your cup, sunlight on a page, subtle texture of wood...",
      color: "bg-[#74B9FF] text-[#18181B]",
    },
    {
      count: 4,
      sense: "FEEL",
      tag: "4 TACTILE TEXTURES",
      instruction: "Notice 4 physical sensations you can touch right now.",
      example: "The fabric of your sleeve, your feet grounding on the floor, the cool desk surface, the breeze...",
      color: "bg-[#55EFC4] text-[#18181B]",
    },
    {
      count: 3,
      sense: "HEAR",
      tag: "3 AUDITORY CUES",
      instruction: "Listen closely for 3 ambient sounds in your surroundings.",
      example: "The subtle hum of electronics, distant chatter or rain, your own rhythmic breathing...",
      color: "bg-[#FFEAA7] text-[#18181B]",
    },
    {
      count: 2,
      sense: "SMELL",
      tag: "2 AROMAS",
      instruction: "Identify 2 scents in the room, or gently inhale the air around you.",
      example: "Warm coffee, crisp fresh air, soap on your hands, or the scent of a clean room...",
      color: "bg-[#D6A2E8] text-[#18181B]",
    },
    {
      count: 1,
      sense: "TASTE",
      tag: "1 TASTE SENSATION",
      instruction: "Notice 1 lingering taste, or take a deliberate sip of cool water.",
      example: "The last sip of tea, mint, or simply the refreshing sensation of hydration...",
      color: "bg-[#FF7675] text-[#18181B]",
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
      const content = `[GRATITUDE JAR ENTRIES]\n\n1. ${gratitude1 || "—"}\n2. ${gratitude2 || "—"}\n3. ${gratitude3 || "—"}`;
      await api.post("/api/journal", {
        mood: "Grateful",
        content,
        tags: ["Gratitude", "Mindfulness"],
        stickers: ["Heart", "Blossom"],
      });
      sounds.playSuccess();
      toast.success("Gratitude deposited into your journal vault!", { icon: "✨" });
      setGratitude1("");
      setGratitude2("");
      setGratitude3("");
      if (onJournalSaved) onJournalSaved();
    } catch (err) {
      toast.error("Could not save gratitude jar.");
    } finally {
      setSavingGratitude(false);
    }
  };

  return (
    <div id="wellness-tools" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10 scroll-mt-24">
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5] relative overflow-hidden">
        {/* Retro Header Accent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b-2 border-[#18181B]/15">
          <div>
            <div className="inline-flex items-center gap-2 pixel-badge bg-[#55EFC4] text-[#18181B] text-[11px] mb-2 font-['Silkscreen']">
              <Sparkles className="w-3.5 h-3.5" />
              CALM & GROUNDING TOOLKIT
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
              Stress Management & Reset Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#18181B]/70 mt-1">
              Interactive neuro-grounding exercises to calm anxiety, sharpen focus, and restore peace.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <span className="text-[11px] font-['Silkscreen'] text-[#18181B]/60 bg-[#18181B]/5 px-2.5 py-1 rounded border border-[#18181B]/15">
              LVL 1 RELIEF
            </span>
          </div>
        </div>

        {/* Tactile Tab Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("breathing");
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-[#18181B] cursor-pointer ${
              activeTab === "breathing"
                ? "bg-[#74B9FF] text-[#18181B] shadow-[3px_3px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#18181B]/70 hover:bg-[#FAF8F5] hover:text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]"
            }`}
          >
            <Wind className="w-4 h-4" />
            <span>Pacer</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("grounding");
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-[#18181B] cursor-pointer ${
              activeTab === "grounding"
                ? "bg-[#55EFC4] text-[#18181B] shadow-[3px_3px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#18181B]/70 hover:bg-[#FAF8F5] hover:text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>5-4-3-2-1</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("timer");
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-[#18181B] cursor-pointer ${
              activeTab === "timer"
                ? "bg-[#FFEAA7] text-[#18181B] shadow-[3px_3px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#18181B]/70 hover:bg-[#FAF8F5] hover:text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Meditation</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab("gratitude");
            }}
            className={`flex items-center justify-center gap-2 py-3 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all border-2 border-[#18181B] cursor-pointer ${
              activeTab === "gratitude"
                ? "bg-[#FF7675] text-white shadow-[3px_3px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]"
                : "bg-white text-[#18181B]/70 hover:bg-[#FAF8F5] hover:text-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]"
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Gratitude</span>
          </button>
        </div>

        {/* TAB 1: RETRO BREATHING PACER */}
        {activeTab === "breathing" && (
          <div className="flex flex-col items-center text-center py-2">
            {/* Mode Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => {
                  sounds.playClick();
                  setBreathingMode("box");
                  resetBreathing();
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-['Silkscreen'] border-2 border-[#18181B] cursor-pointer transition ${
                  breathingMode === "box"
                    ? "bg-[#74B9FF] text-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]"
                    : "bg-white text-[#18181B]/60 hover:text-[#18181B]"
                }`}
              >
                BOX BREATHING (4-4-4-4)
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setBreathingMode("relax");
                  resetBreathing();
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-['Silkscreen'] border-2 border-[#18181B] cursor-pointer transition ${
                  breathingMode === "relax"
                    ? "bg-[#55EFC4] text-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]"
                    : "bg-white text-[#18181B]/60 hover:text-[#18181B]"
                }`}
              >
                4-7-8 RELAXING BREATH
              </button>
            </div>

            <p className="text-xs text-[#18181B]/70 mb-6 max-w-md font-medium">
              {currentModeConfig.desc}
            </p>

            {/* Stepped Pixel Breathing Visualizer */}
            <div className="relative w-64 h-64 flex items-center justify-center my-4">
              {/* Retro Stepped Outer Border Ring */}
              <div
                className={`absolute inset-0 rounded-2xl border-4 border-dashed border-[#18181B]/30 transition-transform duration-1000 ${
                  isBreathingActive ? activeStep.scale : "scale-100"
                }`}
              />

              {/* Central Pixel Pacer Box */}
              <div
                className={`w-52 h-52 rounded-xl border-3 border-[#18181B] bg-white flex flex-col items-center justify-center p-4 transition-all duration-1000 ease-in-out shadow-[5px_5px_0px_#18181B] ${
                  isBreathingActive ? activeStep.scale : "scale-100"
                }`}
              >
                <div
                  className={`px-3 py-1 rounded text-[11px] font-['Silkscreen'] font-bold uppercase tracking-wider mb-2 border border-[#18181B] ${
                    isBreathingActive ? activeStep.color : "bg-[#FAF8F5] text-[#18181B]"
                  }`}
                >
                  {isBreathingActive ? activeStep.label : "READY"}
                </div>

                <span className="text-5xl font-black font-['Press_Start_2P'] text-[#18181B] tracking-tight my-2">
                  {isBreathingActive ? stepSecondsLeft : "00"}
                </span>

                <div className="flex items-center gap-1.5 text-[10px] font-['Silkscreen'] text-[#18181B]/60 mt-1">
                  <PixelFlame className="w-3.5 h-3.5" />
                  <span>{isBreathingActive ? `CYCLE ${cycleCount + 1}` : "PRESS START"}</span>
                </div>
              </div>
            </div>

            {/* Live Instruction Banner */}
            <div className="bg-[#FAF8F5] border-2 border-[#18181B] px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-[#18181B] my-4 shadow-[2px_2px_0px_#18181B] min-h-[42px] flex items-center justify-center">
              {isBreathingActive ? activeStep.hint : "Find an upright, relaxed posture and press Start."}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={toggleBreathing}
                className="pixel-btn pixel-btn-green flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {isBreathingActive ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> START PACER
                  </>
                )}
              </button>

              <button
                onClick={resetBreathing}
                className="pixel-btn flex items-center justify-center p-2.5 text-[#18181B] cursor-pointer"
                title="Reset Cycle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: 5-4-3-2-1 GROUNDING TECHNIQUE */}
        {activeTab === "grounding" && (
          <div className="space-y-6">
            <div className="text-center max-w-lg mx-auto mb-4">
              <span className="text-[11px] font-['Silkscreen'] text-[#00B894] font-bold block mb-1">
                NEURO-SENSORY ANCHOR
              </span>
              <h3 className="text-xl font-black text-[#18181B]">
                5-4-3-2-1 Grounding Protocol
              </h3>
              <p className="text-xs text-[#18181B]/70 mt-1">
                When anxiety spikes, grounding into 5 sensory channels halts runaway mental loops.
              </p>
            </div>

            {/* 5 Stepped Pixel Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {groundingExercises.map((step, idx) => {
                const isCurrent = idx === groundingStep;
                const isPassed = idx < groundingStep;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      sounds.playPop();
                      setGroundingStep(idx);
                    }}
                    className={`p-3 rounded-lg border-2 border-[#18181B] text-center transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#55EFC4] text-[#18181B] shadow-[3px_3px_0px_#18181B] translate-x-[-1px] translate-y-[-1px]"
                        : isPassed
                        ? "bg-white/80 opacity-60 text-[#18181B] shadow-[1px_1px_0px_#18181B]"
                        : "bg-white hover:bg-[#FAF8F5] text-[#18181B] shadow-[2px_2px_0px_#18181B]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded border-2 border-[#18181B] mx-auto flex items-center justify-center font-['Press_Start_2P'] text-xs font-black bg-white mb-1.5 shadow-[1.5px_1.5px_0px_#18181B]">
                      {isPassed ? <Check className="w-4 h-4 text-[#00B894]" /> : step.count}
                    </div>
                    <span className="text-[10px] font-['Silkscreen'] font-bold block uppercase">
                      {step.sense}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Grounding Inspection Box */}
            <div className="bg-white border-2 border-[#18181B] rounded-xl p-6 sm:p-7 text-center max-w-xl mx-auto shadow-[4px_4px_0px_#18181B]">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-['Silkscreen'] font-bold border-2 border-[#18181B] mb-3 ${groundingExercises[groundingStep].color}`}
              >
                STEP {groundingStep + 1} OF 5: {groundingExercises[groundingStep].tag}
              </div>

              <h4 className="text-lg sm:text-xl font-black text-[#18181B] mb-2 font-['Bricolage_Grotesque']">
                {groundingExercises[groundingStep].instruction}
              </h4>

              <div className="bg-[#FAF8F5] border border-[#18181B]/20 p-3 rounded-lg text-xs text-[#18181B]/80 italic max-w-md mx-auto mb-6">
                "{groundingExercises[groundingStep].example}"
              </div>

              <div className="flex items-center justify-center gap-3">
                {groundingStep > 0 && (
                  <button
                    onClick={() => {
                      sounds.playPop();
                      setGroundingStep((s) => s - 1);
                    }}
                    className="pixel-btn px-4 py-2 text-xs font-black uppercase cursor-pointer"
                  >
                    PREVIOUS
                  </button>
                )}

                {groundingStep < groundingExercises.length - 1 ? (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setGroundingStep((s) => s + 1);
                    }}
                    className="pixel-btn pixel-btn-green px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <span>I NOTICED THEM</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      sounds.playSuccess();
                      toast.success("Grounding exercise completed! You are centered.", { icon: "🌿" });
                      setGroundingStep(0);
                    }}
                    className="pixel-btn pixel-btn-yellow px-5 py-2.5 text-xs font-black uppercase flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>COMPLETE SESSION</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MEDITATION TIMER */}
        {activeTab === "timer" && (
          <div className="flex flex-col items-center text-center py-2">
            {/* Presets */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[
                { label: "2M QUICK", sec: 120 },
                { label: "5M RESET", sec: 300 },
                { label: "10M DEEP", sec: 600 },
                { label: "15M REST", sec: 900 },
              ].map((preset) => (
                <button
                  key={preset.sec}
                  onClick={() => selectTimerDuration(preset.sec)}
                  className={`px-3 py-1.5 rounded-md text-xs font-['Silkscreen'] border-2 border-[#18181B] cursor-pointer transition ${
                    timerDuration === preset.sec
                      ? "bg-[#FFEAA7] text-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]"
                      : "bg-white text-[#18181B]/60 hover:text-[#18181B]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Pixel Cassette / Stopwatch Dial */}
            <div className="relative w-64 h-56 rounded-2xl bg-white border-3 border-[#18181B] flex flex-col items-center justify-center shadow-[5px_5px_0px_#18181B] p-4 my-2">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#E17055]" />
                <span className="text-[10px] font-['Silkscreen'] tracking-wider text-[#18181B]/60">
                  {isTimerRunning ? "MEDITATION IN PROGRESS" : "READY FOR AWARENESS"}
                </span>
              </div>

              <span className="text-4xl sm:text-5xl font-black text-[#18181B] font-['Press_Start_2P'] tracking-wider my-1">
                {formatTimer(timerSecondsLeft)}
              </span>

              <div className="flex items-center gap-1.5 mt-3">
                <div className={`w-2 h-2 rounded-full ${isTimerRunning ? "bg-[#00B894] animate-ping" : "bg-[#18181B]/20"}`} />
                <span className="text-[11px] font-['Silkscreen'] text-[#18181B]/60">
                  {isTimerRunning ? "GENTLE BREATHING" : "CLICK START"}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#18181B]/70 max-w-sm mt-3 mb-6 font-medium">
              Lower your shoulders, release jaw tension, and follow your breath naturally.
            </p>

            {/* Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="pixel-btn pixel-btn-yellow flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-wider cursor-pointer"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> PAUSE
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> START MEDITATION
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  sounds.playPop();
                  setIsTimerRunning(false);
                  setTimerSecondsLeft(timerDuration);
                }}
                className="pixel-btn p-2.5 text-[#18181B] cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: GRATITUDE JAR */}
        {activeTab === "gratitude" && (
          <div className="max-w-xl mx-auto space-y-5">
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#FF7675] text-white text-[11px] mb-1 font-['Silkscreen']">
                <PixelHeart className="w-3.5 h-3.5 text-white" />
                DAILY 3 GRATITUDES
              </div>
              <h3 className="text-xl font-black text-[#18181B]">
                Gratitude Deposit Vault
              </h3>
              <p className="text-xs text-[#18181B]/70 mt-1">
                Jot down three small, concrete moments that brought warmth today.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="bg-white p-3.5 rounded-lg border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1.5">
                  1. A PERSON OR KIND INTERACTION:
                </label>
                <input
                  type="text"
                  placeholder="e.g. A kind message from a friend, or polite barista..."
                  value={gratitude1}
                  onChange={(e) => setGratitude1(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#18181B]/20 text-xs sm:text-sm focus:outline-none focus:border-[#18181B] bg-[#FAF8F5]"
                />
              </div>

              <div className="bg-white p-3.5 rounded-lg border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1.5">
                  2. A SENSORY COMFORT OR DETAIL:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scent of freshly brewed coffee, warm socks, soft breeze..."
                  value={gratitude2}
                  onChange={(e) => setGratitude2(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#18181B]/20 text-xs sm:text-sm focus:outline-none focus:border-[#18181B] bg-[#FAF8F5]"
                />
              </div>

              <div className="bg-white p-3.5 rounded-lg border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B]">
                <label className="text-[11px] font-['Silkscreen'] text-[#18181B] block mb-1.5">
                  3. A WIN OR EFFORT I AM PROUD OF:
                </label>
                <input
                  type="text"
                  placeholder="e.g. I gave myself grace and took a deep breath today..."
                  value={gratitude3}
                  onChange={(e) => setGratitude3(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-[#18181B]/20 text-xs sm:text-sm focus:outline-none focus:border-[#18181B] bg-[#FAF8F5]"
                />
              </div>
            </div>

            <button
              onClick={saveGratitudeAsJournal}
              disabled={savingGratitude}
              className="w-full pixel-btn pixel-btn-coral py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{savingGratitude ? "SAVING TO VAULT..." : "DEPOSIT TO GRATITUDE JOURNAL"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessTools;
