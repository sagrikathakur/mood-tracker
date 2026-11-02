import React from "react";
import {
  Terminal,
  Cpu,
  Flame,
  Heart,
} from "lucide-react";
import PixelDither from "./PixelDither";

export const AboutSagrikaStory = () => {
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
    <section id="about" className="w-full bg-[#0c2615] text-white relative">
      {/* Top Pixel Dither from Light (#FCFAF4) to Dark Emerald (#0c2615) */}
      <PixelDither topColor="#FCFAF4" bottomColor="#0c2615" height={28} />

      <div className="max-w-6xl mx-auto space-y-16 py-20 sm:py-28 px-4 sm:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
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
      </div>
    </section>
  );
};

export default AboutSagrikaStory;

