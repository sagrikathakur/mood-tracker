import React from "react";
import { Check, Sparkles, Wind, Code2, Sun, Moon } from "lucide-react";

const SleekChecklist = () => {
  const practices = [
    {
      step: "01",
      icon: Sun,
      title: "Morning Emotional Baseline",
      desc: "Calibrate your nervous system with a quick 1–10 slider check before opening terminal windows, Slack, or Jira queues.",
      benefit: "Prevents starting your workday in unconscious fight-or-flight mode.",
    },
    {
      step: "02",
      icon: Wind,
      title: "Mid-Sprint Calming Resets",
      desc: "Use the built-in Box Breathing or 5-4-3-2-1 sensory grounding when a tricky compiler error or production issue spikes cortisol.",
      benefit: "Disengages hyper-focus anxiety in under 60 seconds.",
    },
    {
      step: "03",
      icon: Code2,
      title: "Burnout Trigger Tagging",
      desc: "Tag influencing factors like merge conflicts, imposter syndrome, meeting overload, or broken CI/CD to uncover why you feel depleted.",
      benefit: "Provides objective clarity instead of self-blame.",
    },
    {
      step: "04",
      icon: Moon,
      title: "Digital Sunset & Gratitude Jar",
      desc: "Log 3 small comforts from your day, close your IDE, and let your mind completely unplug from code logic overnight.",
      benefit: "Promotes restorative deep REM sleep for sharper cognitive focus tomorrow.",
    },
  ];

  return (
    <section id="practices" className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-white border-y border-slate-200/80">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Developer Wellbeing Rhythm</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900">
            A sustainable rhythm for engineers.
          </h2>
          <p className="text-xs sm:text-base text-slate-500 font-normal leading-relaxed">
            Lightweight, high-leverage rituals that fit into any developer's workflow without demanding hours of your time.
          </p>
        </div>

        {/* Practices Cards */}
        <div className="space-y-4">
          {practices.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black font-display text-slate-900 text-sm shrink-0 shadow-2xs">
                    {p.step}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span>{p.title}</span>
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                    {p.benefit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SleekChecklist;
