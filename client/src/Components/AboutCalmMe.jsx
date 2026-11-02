import React from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Cpu,
  Brain,
  ShieldCheck,
  Zap,
  Terminal,
  Heart,
  Sparkles,
  ArrowRight,
  Flame,
  Moon,
  Clock,
  Coffee,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

const AboutCalmMe = () => {
  const { isAuthenticated } = useAuth();

  const developerStressFactors = [
    {
      icon: Terminal,
      title: "Late-Night Debugging & Sprint Crunch",
      desc: "Track how late-night pull requests and tight sprint deadlines disrupt your nervous system and sleep cycles.",
      color: "text-rose-600 bg-rose-50 border-rose-200/80",
    },
    {
      icon: Cpu,
      title: "Context Switching & Tab Overload",
      desc: "Jumping between Slack, Jira, PR reviews, and IDEs splinters deep cognitive bandwidth. Log cognitive exhaustion accurately.",
      color: "text-amber-600 bg-amber-50 border-amber-200/80",
    },
    {
      icon: Flame,
      title: "Burnout Root Cause Correlation",
      desc: "Uncover whether your drop in mood stems from broken CI/CD pipelines, imposter syndrome, or 9 consecutive hours of screen time.",
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/80",
    },
    {
      icon: Coffee,
      title: "Restorative Flow-State Recovery",
      desc: "Quick 2-minute breathwork, hydration check-ins, and eye-strain resets tailored for engineers in high-focus mode.",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200/80",
    },
  ];

  return (
    <section id="about" className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="aura-glow w-[500px] h-[500px] -top-24 -left-24 bg-emerald-500/15" />
      <div className="aura-glow w-[450px] h-[450px] bottom-0 right-0 bg-teal-500/10" />

      <div className="relative z-10 max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Calm Me · Designed & Developed by Sagrika</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12] font-display">
            Built for developers.{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Engineered to decode burnout.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Software engineering demands intense cognitive stamina. As developers, we constantly debug distributed systems, but rarely have tools to debug our own mental state. <strong className="text-white font-bold">Calm Me</strong> was built by developer and designer <strong className="text-emerald-400 font-bold">Sagrika</strong> to help developers track everything: screen exhaustion, code fatigue, sprint pressure, and the hidden root causes of burnout.
          </p>
        </div>

        {/* 4 Developer-Specific Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {developerStressFactors.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 hover:border-emerald-500/50 rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/40 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color} shadow-xs group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Creator Profile & Mission Statement Box */}
        <div className="bg-gradient-to-r from-slate-800/90 via-slate-800/60 to-slate-800/90 border border-slate-700/90 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-8 text-center lg:text-left">
            {/* Avatar / Badge */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 text-3xl font-black font-display">
                ST
              </div>
              <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-emerald-500/40 text-emerald-400 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                Dev & UX
              </div>
            </div>

            {/* Quote and Details */}
            <div className="space-y-3 flex-1">
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-white font-display">
                  Sagrika
                </h3>
                <span className="text-slate-500 hidden sm:inline">·</span>
                <span className="text-xs font-semibold text-emerald-400">
                  Lead Designer & Full-Stack Developer
                </span>
              </div>

              <blockquote className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "Modern developer culture often glorifies late-night hustle, 14-hour screen sprints, and pushing through chronic mental fatigue. I built <strong className="text-white font-semibold">Calm Me</strong> because I wanted engineers to have an honest, compassionate, and 100% private sanctuary to understand what truly triggers their burnout, protect their sleep, and rebuild a healthy baseline without guilt."
              </blockquote>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Private & Client-Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-teal-400" />
                  Built by a Developer, for Developers
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  Zero-Guilt Wellbeing
                </span>
              </div>
            </div>

            {/* Call to action */}
            <div className="shrink-0 pt-2 lg:pt-0">
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Track Your Baseline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCalmMe;
