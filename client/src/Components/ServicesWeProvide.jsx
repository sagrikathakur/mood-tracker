import React from "react";
import { Smile, BookOpen, Wind, Search, Compass, Sparkles, ArrowRight } from "lucide-react";

const SERVICES = [
  {
    icon: Smile,
    title: "Daily Mood Tracking & Trends",
    desc: "Record your emotional state in one tap across 8 nuanced moods. Visualize your 7-day emotional flow and celebrate your consistency streaks.",
    tag: "Core Tracker",
    theme: "from-emerald-500 to-teal-600",
  },
  {
    icon: BookOpen,
    title: "Visual Memory Scrapbook",
    desc: "Transform plain journaling into a visual keepsake. Attach fun stickers, upload photos from your phone or camera, and save meaningful moments.",
    tag: "Memory Journal",
    theme: "from-amber-500 to-orange-600",
  },
  {
    icon: Wind,
    title: "Guided Calm & Breathwork",
    desc: "Science-backed 4-7-8 and Box breathing timers with an animated rhythm circle and ambient ocean sound generator to de-escalate stress in 2 minutes.",
    tag: "Mindful Reset",
    theme: "from-cyan-500 to-blue-600",
  },
  {
    icon: Search,
    title: "Searchable History & Filters",
    desc: "Find past memories instantly. Filter your timeline by specific moods (e.g. only Happy or Calm days) or search for keywords like travel or family.",
    tag: "Timeline",
    theme: "from-indigo-600 to-violet-700",
  },
  {
    icon: Compass,
    title: "Self-Care Emotional Compass",
    desc: "Get personalized self-care recommendations for every mood. Learn actionable micro-habits to calm anxiety, channel joy, or honor tiredness.",
    tag: "Wellness Guide",
    theme: "from-rose-500 to-pink-600",
  },
  {
    icon: Sparkles,
    title: "Daily Reflection Affirmations",
    desc: "Start each day grounded with daily wisdom, quotes on gratitude and resilience, and guided prompts ready for your journal entry.",
    tag: "Daily Inspiration",
    theme: "from-purple-500 to-indigo-600",
  },
];

const ServicesWeProvide = () => {
  return (
    <section id="services" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-16 scroll-mt-24">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl shadow-slate-200/40">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            <Sparkles className="w-3.5 h-3.5" />
            Services We Provide
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Complete Emotional Wellness Kit
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Thoughtful tools crafted to help you reflect, unwind, and build self-awareness.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {SERVICES.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${srv.theme} text-white shadow-md group-hover:scale-105 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200/60">
                      {srv.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 tracking-tight pt-1">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {srv.desc}
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

export default ServicesWeProvide;
