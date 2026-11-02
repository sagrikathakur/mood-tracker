import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, BarChart3, Lock, ShieldCheck } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";
import PixelDither from "./PixelDither";
import assets from "../assets/asset";

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
    <section className="w-full bg-[#FCFAF4] text-slate-900 relative">
      {/* Top Pixel Dither from Dark (#091b10) to Light (#FCFAF4) */}
      <PixelDither topColor="#091b10" bottomColor="#FCFAF4" height={28} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-20 sm:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display leading-[1.15]">
              You&apos;re in charge.{" "}
              <span className="text-emerald-700">Without hovering.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              See what drained your stamina, understand where sprint pressure peaked,
              adjust your personal wellness boundaries, and keep everything strictly private.
            </p>

            <div>
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#0a1b10] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer"
              >
                <span>Set up your sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Retro PC Asset Artwork (Cover position, clean with no text) */}
            <div className="pt-2">
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white max-w-xs group">
                <img
                  src={assets.retro_pc}
                  alt="Retro Dev Machine"
                  className="w-full h-44 sm:h-52 object-cover object-center group-hover:scale-103 transition-transform duration-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: 2x2 Grid (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {controlCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200/90 hover:border-slate-300 rounded-3xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 border border-emerald-200/60 text-emerald-800 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-1.5">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
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

