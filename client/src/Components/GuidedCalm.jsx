import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Wind } from "lucide-react";

const TECHNIQUES = [
  {
    name: "4-7-8 Relax",
    desc: "Reduces anxiety and prepares body for sleep",
    inhale: 4,
    hold: 7,
    exhale: 8,
  },
  {
    name: "Box Breathing",
    desc: "Used by Navy SEALs to regain mental focus",
    inhale: 4,
    hold: 4,
    exhale: 4,
  },
  {
    name: "2-4 Calming",
    desc: "Quick heart-rate reset in under a minute",
    inhale: 2,
    hold: 1,
    exhale: 4,
  },
];

const GuidedCalm = () => {
  const [selectedTech, setSelectedTech] = useState(TECHNIQUES[0]);
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState("idle"); // 'idle' | 'inhale' | 'hold' | 'exhale'
  const [timer, setTimer] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Web Audio Context reference for gentle ambient wave sound
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Create white noise buffer for soft ocean breeze
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter to create deep ocean wave sound
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNodeRef.current = gainNode;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      whiteNoise.start(0);
    }

    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
  };

  const toggleSound = () => {
    if (!soundEnabled) {
      initAudio();
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0.04, audioCtxRef.current.currentTime);
      }
      setSoundEnabled(true);
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      }
      setSoundEnabled(false);
    }
  };

  // Main Breathing State Loop
  useEffect(() => {
    let interval = null;

    if (isActive) {
      if (phase === "idle") {
        setPhase("inhale");
        setTimer(selectedTech.inhale);
      } else {
        interval = setInterval(() => {
          setTimer((prev) => {
            if (prev > 1) {
              return prev - 1;
            }

            // Phase transition
            if (phase === "inhale") {
              setPhase("hold");
              return selectedTech.hold;
            } else if (phase === "hold") {
              setPhase("exhale");
              return selectedTech.exhale;
            } else if (phase === "exhale") {
              setCycles((c) => c + 1);
              setPhase("inhale");
              return selectedTech.inhale;
            }
            return 0;
          });
        }, 1000);
      }
    } else {
      setPhase("idle");
      setTimer(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phase, selectedTech]);

  const resetBreath = () => {
    setIsActive(false);
    setPhase("idle");
    setTimer(0);
    setCycles(0);
  };

  // Scale computation for visual circle
  const getScaleClass = () => {
    if (phase === "inhale") return "scale-125 transition-transform duration-[4000ms] ease-out";
    if (phase === "hold") return "scale-125 shadow-2xl shadow-cyan-400/50";
    if (phase === "exhale") return "scale-90 transition-transform duration-[6000ms] ease-in-out";
    return "scale-100";
  };

  const getPhaseText = () => {
    if (phase === "inhale") return "Inhale Deeply";
    if (phase === "hold") return "Hold Gently";
    if (phase === "exhale") return "Release & Exhale";
    return "Ready To Begin?";
  };

  const getPhaseColor = () => {
    if (phase === "inhale") return "text-teal-300";
    if (phase === "hold") return "text-cyan-300";
    if (phase === "exhale") return "text-indigo-300";
    return "text-white/80";
  };

  return (
    <section id="meditation" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-16 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-300 border border-white/10 mb-2">
              <Wind className="w-3.5 h-3.5" />
              Mindful Breathwork
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Guided Calm & Breath Reset
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Slow your heart rate and ground your mind in just 2 minutes.
            </p>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              soundEnabled
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-sm"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? "Ocean Breeze: ON" : "Ambient Sound: OFF"}</span>
          </button>
        </div>

        {/* Technique Picker Pills */}
        <div className="relative z-10 flex flex-wrap gap-2.5 my-6">
          {TECHNIQUES.map((tech) => (
            <button
              key={tech.name}
              type="button"
              onClick={() => {
                setSelectedTech(tech);
                resetBreath();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedTech.name === tech.name
                  ? "bg-white text-slate-900 shadow-md"
                  : "bg-white/10 text-slate-300 hover:bg-white/15"
              }`}
            >
              {tech.name}
            </button>
          ))}
          <span className="text-xs text-slate-400 flex items-center ml-2 italic">
            {selectedTech.desc}
          </span>
        </div>

        {/* Interactive Breathing Visualizer */}
        <div className="relative z-10 flex flex-col items-center justify-center py-12">
          {/* Outer Ripple Rings */}
          <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
            {isActive && (
              <>
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping opacity-30" />
                <div className="absolute -inset-4 rounded-full border border-indigo-400/20 animate-pulse opacity-40" />
              </>
            )}

            {/* Glowing Center Circle */}
            <div
              className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-cyan-500/30 via-indigo-600/40 to-teal-400/30 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center text-center p-4 transition-all duration-700 shadow-2xl ${getScaleClass()}`}
            >
              <span className={`text-sm sm:text-base font-extrabold uppercase tracking-widest ${getPhaseColor()} transition-colors`}>
                {getPhaseText()}
              </span>

              {isActive ? (
                <span className="text-5xl sm:text-6xl font-black mt-2 tracking-tight text-white drop-shadow">
                  {timer}s
                </span>
              ) : (
                <Sparkles className="w-8 h-8 text-cyan-300 my-2 animate-pulse" />
              )}

              {isActive && (
                <span className="text-xs text-white/60 font-semibold mt-1">
                  Cycle #{cycles + 1}
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mt-10">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white text-slate-900 font-bold text-sm shadow-xl hover:bg-cyan-300 transition active:scale-95 cursor-pointer"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Breathing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Relaxation</span>
                </>
              )}
            </button>

            {isActive && (
              <button
                type="button"
                onClick={resetBreath}
                className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidedCalm;
