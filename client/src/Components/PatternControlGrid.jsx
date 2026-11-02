import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, BarChart3, Lock, ShieldCheck } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";
import PixelDither from "./PixelDither";

export const PatternControlGrid = () => {
  const { isAuthenticated } = useAuth();

  const controlCards = [
    {
      icon: Mail,
      title: "A weekly note",
      desc: "What drained your energy and where focus was restored, in plain language, waiting in your private dashboard every Monday morning.",
    },
    {
      icon: BarChart3,
      title: "A Correlation page",
      desc: "This week at a glance: IDE screen hours, sleep duration, and emotional baseline correlations to try adjustments at your desk.",
    },
    {
      icon: Lock,
      title: "Settings behind a PIN",
      desc: "Instant 4-digit numerical lock. Screen locks automatically when stepping away in shared workspaces or coffee shops.",
    },
    {
      icon: ShieldCheck,
      title: "Private by default",
      desc: "A developer handle, not corporate email. No workplace surveillance, no ads, no trackers. 100% client-encrypted.",
    },
  ];

  return (
    <section className="w-full bg-[#0c2615] text-white relative">
      {/* Top Pixel Dither */}
      <PixelDither topColor="#091b10" bottomColor="#0c2615" height={24} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display leading-[1.15]">
              You&apos;re in charge.{" "}
              <span className="text-[#64DC4C]">Without hovering.</span>
            </h2>
            <p className="text-sm sm:text-base text-emerald-200/80 font-normal leading-relaxed">
              See what drained your stamina, understand where sprint pressure peaked,
              adjust your personal wellness boundaries, and keep everything strictly private.
            </p>

            <div>
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/30 transition-all duration-200 cursor-pointer"
              >
                <span>Set up your sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: 2x2 Grid (7 Cols - Matches Frame 00:02 - 00:03) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {controlCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#123820] hover:bg-[#164327] border border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-900/40 border border-emerald-400/20 text-[#64DC4C] flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-display mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-200/70 font-normal leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternControlGrid;

