import React from "react";
import { Wind, ShieldAlert, Brain, Moon, Sparkles, Activity, ArrowRight } from "lucide-react";

const CALM_BENEFITS = [
  {
    icon: ShieldAlert,
    title: "Downregulates Chronic Fight-or-Flight",
    description:
      "Constant notifications, emails, and deadlines trap your body in high-alert survival mode. Deliberate calm signals safety, lowering cortisol and physical tension.",
    highlight: "Lower Cortisol",
  },
  {
    icon: Activity,
    title: "Stimulates The Vagus Nerve",
    description:
      "Slow, extended exhalations activate your parasympathetic nervous system, naturally reducing your resting heart rate and relaxing constricted blood vessels.",
    highlight: "Heart-Rate Reset",
  },
  {
    icon: Brain,
    title: "Clarity Over Emotional Reactivity",
    description:
      "When anxiety spikes, your amygdala hijacks decision-making. Taking a 2-minute breather restores prefrontal cortex control so you respond rather than react.",
    highlight: "Mental Focus",
  },
  {
    icon: Moon,
    title: "Unlocks Deep Restorative Sleep",
    description:
      "Journaling your daily emotions and breathing mindfully before bed empties working memory, preventing racing thoughts from sabotaging your sleep cycles.",
    highlight: "Better Sleep",
  },
];

const WhyNeedCalm = () => {
  return (
    <section id="why-calm" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-16 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-2xl border border-white/10">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-300 border border-white/15">
            <Wind className="w-3.5 h-3.5" />
            The Science of Stillness
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Why You Need Calm in Daily Life
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In a world built on continuous distraction and cognitive overload, calm is not a luxury—it is an essential physiological reset button.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {CALM_BENEFITS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors duration-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-full border border-cyan-800/60">
                    {item.highlight}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call To Action Box */}
        <div className="relative z-10 p-6 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-teal-500/20 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="text-base font-bold text-white">Feel the difference in 2 minutes</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Experience the 4-7-8 relaxing breathwork right on this page.
            </p>
          </div>
          <a
            href="#meditation"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-bold text-xs sm:text-sm shadow-lg hover:bg-cyan-300 transition active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <span>Try Guided Calm</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default WhyNeedCalm;
