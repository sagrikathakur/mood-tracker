import React from "react";
import { ShieldCheck, Lock, Download, Trash2, Sparkles, KeyRound } from "lucide-react";

const SleekPrivateGrid = () => {
  const privacyPillars = [
    {
      icon: ShieldCheck,
      title: "Encrypted & Non-Harvested",
      desc: "Your reflections, mood check-ins, and burnout triggers are never sold, scraped, or used to train third-party machine learning models.",
    },
    {
      icon: Lock,
      title: "Instant 4-Digit PIN Lock",
      desc: "Working in shared offices or coffee shops? Lock your sanctuary behind a numerical PIN with one click when stepping away.",
    },
    {
      icon: Download,
      title: "One-Click JSON Data Export",
      desc: "Full data portability. Download a comprehensive JSON backup containing all your mood scores, sleep logs, and thoughts anytime.",
    },
    {
      icon: Trash2,
      title: "Permanent GDPR Data Purge",
      desc: "You have ultimate ownership over your personal record. Permanently delete your entire account and all associated data with zero trace.",
    },
  ];

  return (
    <section className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-[#FAFAFA] text-slate-900">
      <div className="max-w-6xl mx-auto space-y-14">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Privacy Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900">
            Private by design.{" "}
            <span className="text-emerald-600">Always.</span>
          </h2>
          <p className="text-xs sm:text-base text-slate-500 font-normal leading-relaxed">
            Developers deserve an authentic space to express burnout, frustrations, and candid thoughts without fear of workplace surveillance.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {privacyPillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-7 sm:p-9 border border-slate-200/80 shadow-sm space-y-4 hover:border-slate-300 hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center shadow-2xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    {p.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                    {p.desc}
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

export default SleekPrivateGrid;
