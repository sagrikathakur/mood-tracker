import React from "react";
import { Link } from "react-router-dom";
import { Terminal, Shield, Moon, Heart, Sparkles, ArrowRight, Code2 } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

const SleekFeatureGrid = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Terminal,
      tag: "Feature 01",
      title: "Sprint & Mood Trajectory",
      desc: "Connect your emotional highs and lows to sprint cadences, production incidents, and release cycles. Notice patterns before exhaustion turns into full burnout.",
      accent: "text-emerald-600 bg-emerald-50 border-emerald-200/60",
    },
    {
      icon: Moon,
      tag: "Feature 02",
      title: "IDE Screen Hours vs. Sleep",
      desc: "Track daily hours spent staring at monitors, hydration glasses, and nightly rest. Discover how late-night debugging directly alters the next morning's cognitive bandwidth.",
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200/60",
    },
    {
      icon: Shield,
      tag: "Feature 03",
      title: "PIN-Protected Sanctuary Lock",
      desc: "Your candid thoughts, work frustrations, and journal entries are strictly client-encrypted and locked behind an instant 4-digit numeric PIN.",
      accent: "text-amber-600 bg-amber-50 border-amber-200/60",
    },
    {
      icon: Heart,
      tag: "Feature 04",
      title: "Zero-Guilt Engineering",
      desc: "No toxic XP leaderboards, no broken streak shaming, and no hustle hype. Calm Me is designed with gentleness to let you rest without guilt.",
      accent: "text-rose-600 bg-rose-50 border-rose-200/60",
    },
  ];

  return (
    <section id="features" className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-[#FAFAFA] text-slate-900 relative">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Developer-First Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900">
            You're in charge.{" "}
            <span className="text-emerald-600">Without pressure.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-500 font-normal leading-relaxed">
            Engineered by developer Sagrika to give programmers real visibility into their energy reserves, code fatigue, and burnout prevention.
          </p>
        </div>

        {/* 2x2 Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {f.tag}
                    </span>
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${f.accent} shadow-2xs group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-emerald-700 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SleekFeatureGrid;
