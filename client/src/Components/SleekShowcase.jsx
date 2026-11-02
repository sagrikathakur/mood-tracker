import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  TrendingUp,
  Brain,
  Shield,
  Moon,
  Zap,
  Code2,
  Terminal,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";

const SleekShowcase = () => {
  const [activeScenario, setActiveScenario] = useState("sprint");

  const scenarios = {
    sprint: {
      title: "Sprint Crunch & Merge Overload",
      tagline: "Late PR reviews, failing tests, context switching",
      score: "3.4 / 10",
      stress: "High Tension (8/10)",
      sleep: "5.5h (Disrupted)",
      insight:
        "Calm Me detected 4 late-night git commits and high stress. Sleep quality dropped 35%. Recommendation: Schedule a 15-minute screen-free reset.",
      color: "border-rose-200 bg-rose-50/50",
      pill: "bg-rose-100 text-rose-800",
    },
    flow: {
      title: "Deep Flow & Architecture Building",
      tagline: "Uninterrupted focus, clean code, low friction",
      score: "8.9 / 10",
      stress: "Optimal Baseline (2/10)",
      sleep: "7.8h (Deep)",
      insight:
        "Focus was maintained for 3h without context switching. Energy levels remained stable. Restorative walking ritual supported creative stamina.",
      color: "border-emerald-200 bg-emerald-50/50",
      pill: "bg-emerald-100 text-emerald-800",
    },
    recovery: {
      title: "Post-Release Recovery & Rest",
      tagline: "Decompression, gentle reflection, cognitive reset",
      score: "7.2 / 10",
      stress: "Calm & Grounded (3/10)",
      sleep: "8.2h (Restorative)",
      insight:
        "Nervous system has recalibrated. 5-4-3-2-1 grounding protocol was utilized after standup. Cognitive bandwidth fully restored.",
      color: "border-sky-200 bg-sky-50/50",
      pill: "bg-sky-100 text-sky-800",
    },
  };

  const current = scenarios[activeScenario];

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-white border-y border-slate-200/80">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Interactive Dev Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight font-display">
            It doesn&apos;t judge your productivity.{" "}
            <span className="text-emerald-600">It listens to your state.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Calm Me cross-references your daily coding stress, late-night hours, and journaling themes to decode the hidden causes of developer burnout.
          </p>
        </div>

        {/* Interactive Scenario Selector */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 gap-1.5 max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveScenario("sprint");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeScenario === "sprint"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sprint Crunch
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveScenario("flow");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeScenario === "flow"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Deep Flow State
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveScenario("recovery");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeScenario === "recovery"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Post-Release Recovery
            </button>
          </div>
        </div>

        {/* Live Preview Card */}
        <div className="max-w-4xl mx-auto bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm transition-all duration-300">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${current.pill}`}>
                {current.title}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Developer State Synthesis
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {current.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mood Score</span>
                <span className="text-base font-black text-slate-900 font-display">{current.score}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Stress Level</span>
              <span className="text-sm font-bold text-slate-800">{current.stress}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Sleep Duration</span>
              <span className="text-sm font-bold text-slate-800">{current.sleep}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-400 block mb-1">Engine Analysis</span>
              <span className="text-sm font-bold text-emerald-700">Real-time Correlation</span>
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${current.color}`}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                <Brain className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-0.5">Calm Me Insight</span>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {current.insight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SleekShowcase;

