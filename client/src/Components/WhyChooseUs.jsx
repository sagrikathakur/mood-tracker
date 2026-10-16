import React from "react";
import { Shield, Sparkles, Clock, TrendingUp, Heart, CheckCircle2 } from "lucide-react";

const WHY_US_PILLARS = [
  {
    icon: Shield,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    title: "100% Private & Encrypted",
    description:
      "Your mental health is sacred. Your personal thoughts, mood ratings, and photos are never sold, mined, or shared with advertisers.",
  },
  {
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    title: "Visual & Expressive",
    description:
      "Journaling shouldn't feel like a chore of plain text. Capture your day visually with cute stickers, vibrant mood colors, and photo memories.",
  },
  {
    icon: Clock,
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    title: "Effortless 30-Second Check-Ins",
    description:
      "No tedious questionnaires. A simple 1-click mood tap and a short note make it easy to stay consistent, even on your busiest days.",
  },
  {
    icon: TrendingUp,
    color: "text-cyan-600 bg-cyan-50 border-cyan-200",
    title: "Actionable Pattern Insights",
    description:
      "Discover weekly emotional rhythms and streak milestones to notice stressors and self-care wins before burnout happens.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-16 scroll-mt-24">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl shadow-slate-200/40">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Why Choose Us
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Peace of Mind
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A safe, non-judgmental space to connect with your inner world every day.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {WHY_US_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:shadow-md transition duration-200 space-y-3"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero Ads or Trackers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Credentials</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Persistent Device Session</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
