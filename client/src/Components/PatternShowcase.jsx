import React from "react";
import { Code2, Zap, Volume2 } from "lucide-react";
import assets from "../assets/asset";

export const PatternShowcase = () => {
  return (
    <section className="w-full bg-[#091b10] text-white relative">
      {/* Simple Divider Line */}
      <div className="w-full border-t border-emerald-900/60" />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
          {/* Left Column: Copy & 3 Iconic Points */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-[1.15]">
                It doesn&apos;t judge your productivity.{" "}
                <span className="text-[#64DC4C]">It listens.</span>
              </h2>
              <p className="text-sm sm:text-base text-emerald-200/80 font-normal leading-relaxed">
                Then it decodes, one small step at a time, and only as much as you need. Log your baseline,
                isolate code fatigue, or take a gentle 60-second breathing pause between pull requests.
              </p>
            </div>

            {/* 3 Iconic Bullets with Colored Badges (Frame 00:01) */}
            <div className="space-y-5">
              {/* Bullet 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Developer Lifestyle Correlation
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300/70 mt-0.5 leading-relaxed">
                    Exact arithmetic between screen hours, sleep quality, and baseline mood — never guessed by an automated bot.
                  </p>
                </div>
              </div>

              {/* Bullet 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-orange-400/10 border border-orange-400/30 flex items-center justify-center shrink-0 text-orange-400">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Burnout Guardrails & Triggers
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300/70 mt-0.5 leading-relaxed">
                    Pinpoints whether late-night PR merges, meeting overload, or context-switching caused your stamina dip.
                  </p>
                </div>
              </div>

              {/* Bullet 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center shrink-0 text-[#64DC4C]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    Kind, Non-Judgmental Sanctuary
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-300/70 mt-0.5 leading-relaxed">
                    No broken streak shaming, no toxic productivity leaderboards. Rest without guilt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Developer Burnout Artwork from Asset Folder (Clean cover, no text) */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md sm:max-w-lg rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl bg-[#0c2615] group">
              <img
                src={assets.burnout_cat}
                alt="Late-Night Debugging & Code Fatigue"
                className="w-full h-80 sm:h-96 md:h-[460px] object-cover object-center group-hover:scale-103 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternShowcase;
