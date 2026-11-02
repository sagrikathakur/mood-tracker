import React from "react";
import { Link } from "react-router-dom";
import {
  Code2,
  Terminal,
  Cpu,
  Flame,
  Heart,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

export const AboutSagrikaStory = () => {
  const { isAuthenticated } = useAuth();

  const developerTriggers = [
    {
      icon: Terminal,
      title: "Late-Night Debugging & Sprint Crunch",
      desc: "Track how late-night PR reviews, failing test suites, and deadline crunches alter your cognitive stamina.",
    },
    {
      icon: Cpu,
      title: "Context-Switching & Tab Overload",
      desc: "Jumping between Slack, Jira, PRs, and IDEs splinters attention. Measure screen exhaustion before it spirals into burnout.",
    },
    {
      icon: Flame,
      title: "Burnout Root-Cause Correlation",
      desc: "Identify whether your mood dips stem from CI/CD blockers, imposter syndrome, or 8 consecutive hours without screen breaks.",
    },
    {
      icon: Heart,
      title: "Guilt-Free Restorative Recovery",
      desc: "Guided 60-second breathing pacers, hydration check-ins, and eye-strain resets built directly into your workflow.",
    },
  ];

  return (
    <section id="about" className="w-full bg-[#0c2615] text-white border-t border-emerald-950/60 py-20 sm:py-28 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[#64DC4C] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Calm Me · Designed & Developed by Sagrika</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-[1.15]">
            Built for developers.{" "}
            <span className="text-[#64DC4C]">Engineered to decode burnout.</span>
          </h2>

          <p className="text-sm sm:text-base text-emerald-200/80 leading-relaxed font-normal">
            Software engineering demands intense cognitive stamina. As developers, we constantly debug
            complex production systems, but rarely have tools to debug our own mental state.{" "}
            <strong className="text-white font-bold">Calm Me</strong> was built by developer and UX designer{" "}
            <strong className="text-[#64DC4C] font-bold">Sagrika</strong> so software engineers can track everything:
            their burnout, the exact reasons behind it, and rebuild a healthy baseline with zero pressure.
          </p>
        </div>

        {/* 4 Developer Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {developerTriggers.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#10331c] border border-emerald-500/20 hover:border-emerald-400/40 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-900/50 border border-emerald-400/30 text-[#64DC4C] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-xs text-emerald-200/70 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Creator Profile Card */}
        <div className="bg-[#123820] border border-emerald-500/30 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          {/* Avatar Initials */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#22c55e] to-[#64DC4C] flex items-center justify-center text-slate-950 text-3xl font-black font-display shrink-0 shadow-lg shadow-emerald-950/50">
            ST
          </div>

          {/* Profile Bio */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center md:justify-start">
              <h3 className="text-2xl font-black text-white font-display">Sagrika</h3>
              <span className="text-emerald-400 hidden sm:inline">·</span>
              <span className="text-xs font-semibold text-emerald-300">
                Lead Designer & Full-Stack Developer
              </span>
            </div>

            <blockquote className="text-xs sm:text-sm text-emerald-100/90 italic leading-relaxed">
              &ldquo;Modern developer culture often glorifies late-night hustle and pushing through chronic mental fatigue.
              I built Calm Me because I wanted engineers to have an honest, compassionate, and 100% private sanctuary to
              understand what truly triggers their burnout, protect their sleep, and rebuild a healthy baseline without guilt.&rdquo;
            </blockquote>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-xs text-emerald-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#64DC4C]" />
                100% Client-Encrypted
              </span>
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#64DC4C]" />
                Built by a Developer, for Developers
              </span>
            </div>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            <Link
              to={isAuthenticated ? "/tracker" : "/login"}
              onClick={() => sounds.playClick()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#64DC4C] hover:bg-[#52c83a] text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Track Your Baseline</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSagrikaStory;

