import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Terminal,
  Zap,
  Volume2,
  RotateCcw,
  Wind,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { PixelFox, PixelOwl } from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import PixelDither from "./PixelDither";

const SCENARIOS = [
  {
    id: 1,
    pill: "Sprint 42 Simulation · Late-Night Debugging",
    question:
      "You've been debugging a failing test suite for 3 hours. Slack is buzzing, PR reviews are piling up, and it's 11 PM. How does your nervous system feel?",
    avatarMsg: "Take your time. I'm right here with you.",
    options: [
      {
        label: "High Cortisol & Brain Fog",
        score: "3/10",
        feedback:
          "Cortisol is high. Push pause on that merge. Stepping away for 10 minutes restores more cognition than another cup of coffee.",
      },
      {
        label: "Tense Shoulders & Caffeine Spike",
        score: "4/10",
        feedback:
          "Physical tension detected. Drop your shoulders away from your ears, un-clench your jaw, and drink a glass of water.",
      },
      {
        label: "Flow State (Energized)",
        score: "8/10",
        feedback:
          "Great focus momentum! Just remember to blink frequently and schedule an eye-strain break in 45 minutes.",
      },
      {
        label: "Exhausted & Ready to Close IDE",
        score: "2/10",
        feedback:
          "Listen to your body. Close your laptop. The code will still be here tomorrow, and sleep will solve what caffeine cannot.",
      },
    ],
  },
  {
    id: 2,
    pill: "Release Day · Merge Conflicts",
    question:
      "A massive merge conflict just broke the staging build right before scheduled deployment. The team lead is asking for an ETA. What is your impulse?",
    avatarMsg: "Breathe in. You've solved harder problems than this.",
    options: [
      {
        label: "Panic & Imposter Syndrome",
        score: "3/10",
        feedback:
          "Merge conflicts are a natural byproduct of collaboration, not an evaluation of your worth as an engineer.",
      },
      {
        label: "Methodical Git Rebase",
        score: "7/10",
        feedback:
          "Calm engineering mode engaged. Diff line by line, keep the team updated with a calm 15-minute expectation.",
      },
      {
        label: "Total Sensory Overload",
        score: "2/10",
        feedback:
          "Step outside for 60 seconds of cold air. Disengage the fight-or-flight response before typing another git command.",
      },
      {
        label: "Asking a Peer for a Second Pair of Eyes",
        score: "9/10",
        feedback:
          "Healthy collaboration at its finest. Two developers solve merge ambiguity twice as fast without cognitive burnout.",
      },
    ],
  },
];

export const PatternShowcase = () => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [breathingActive, setBreathingActive] = useState(false);

  const scenario = SCENARIOS[scenarioIndex];

  const handleSelectOption = (idx) => {
    sounds.playBlip(400 + idx * 60);
    setSelectedOptionIndex(idx);
  };

  const handleNewQuestion = () => {
    sounds.playClick();
    setSelectedOptionIndex(null);
    setScenarioIndex((prev) => (prev + 1) % SCENARIOS.length);
  };

  const handleBreathReset = () => {
    sounds.playCalmTone(440, 0.4);
    setBreathingActive(true);
    setTimeout(() => setBreathingActive(false), 4000);
  };

  return (
    <section className="w-full bg-[#091b10] text-white relative">
      {/* Top Pixel Dither from Meadow Green to Dark Green */}
      <PixelDither topColor="#90D786" bottomColor="#091b10" height={28} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Left Column: Copy & 3 Iconic Points */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-[1.15]">
                It doesn&apos;t judge your productivity.{" "}
                <span className="text-[#64DC4C]">It listens.</span>
              </h2>
              <p className="text-sm sm:text-base text-emerald-200/80 font-normal leading-relaxed">
                Then it decodes, one small step at a time, and only as much as you need. Log your baseline,
                isolate code fatigue, or take a gentle 60-second breathing pause between pull requests.
              </p>
            </div>

            {/* 3 Iconic Bullets with Colored Badges (Frame 00:01) */}
            <div className="space-y-5">
              {/* Bullet 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Developer Lifestyle Correlation
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300/70 mt-0.5 leading-relaxed">
                    Exact arithmetic between screen hours, sleep quality, and baseline mood — never guessed by an automated bot.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-400/10 border border-orange-400/30 flex items-center justify-center shrink-0 text-orange-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Burnout Guardrails & Triggers
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300/70 mt-0.5 leading-relaxed">
                    Pinpoints whether late-night PR merges, meeting overload, or context-switching caused your stamina dip.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center shrink-0 text-[#64DC4C]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Kind, Non-Judgmental Sanctuary
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300/70 mt-0.5 leading-relaxed">
                    No broken streak shaming, no toxic productivity leaderboards. Rest without guilt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Card Simulator (Matches Frame 00:01) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 border-4 border-slate-900/10 transition-all duration-300">
            {/* Card Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Status: Standby · Calm Me Listens
              </span>
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                {scenario.pill}
              </span>
            </div>

            {/* Scenario Question */}
            <div className="my-5 space-y-3">
              <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {scenario.question}
              </p>

              {/* Character Speech Bubble */}
              <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200/60 p-3 rounded-2xl">
                <PixelOwl className="w-9 h-9 shrink-0" animated={false} />
                <p className="text-xs text-emerald-900 font-semibold italic">
                  &ldquo;{breathingActive ? "Inhale calm... exhale tension... 🌿" : scenario.avatarMsg}&rdquo;
                </p>
              </div>
            </div>

            {/* Pick an Answer Header */}
            <div className="space-y-2 mb-6">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Pick your current baseline:
              </span>

              {/* 4 Answer Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {scenario.options.map((opt, idx) => {
                  const isSelected = selectedOptionIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                        isSelected
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-slate-50 border-slate-200/90 text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className={`text-[10px] mt-1 ${isSelected ? "text-emerald-400" : "text-slate-400"}`}>
                        Mood: {opt.score}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Alert if selected */}
              {selectedOptionIndex !== null && (
                <div className="mt-3 p-3.5 rounded-2xl bg-[#091b10] text-emerald-300 border border-emerald-600/40 text-xs font-medium leading-relaxed animate-in fade-in duration-200 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#64DC4C] shrink-0 mt-0.5" />
                  <span>{scenario.options[selectedOptionIndex].feedback}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions: I'm Stuck / New Question */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleBreathReset}
                className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Wind className="w-3.5 h-3.5 text-amber-700" />
                <span>{breathingActive ? "Pacing 4-second breath..." : "I'm stuck / Need breath"}</span>
              </button>

              <button
                type="button"
                onClick={handleNewQuestion}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                <span>New scenario</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternShowcase;

