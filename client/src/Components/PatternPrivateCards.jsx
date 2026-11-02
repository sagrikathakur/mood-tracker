import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";
import assets from "../assets/asset";

export const PatternPrivateCards = () => {
  const { isAuthenticated } = useAuth();

  const privateCards = [
    {
      title: "No corporate surveillance",
      desc: "Never tied to company Slack, Jira, or workplace monitoring tools. Your personal space is sacred.",
    },
    {
      title: "No ads, no trackers",
      desc: "Zero tracking cookies, zero marketing analytics. Your private journal entries are never harvested or sold.",
    },
    {
      title: "Developers in control",
      desc: "Full data portability. Export an entire JSON backup or permanently purge all records with zero trace.",
    },
    {
      title: "Nothing to install",
      desc: "Runs directly in the browser across laptops, external displays, and mobile devices with instant response.",
    },
  ];

  return (
    <section className="w-full bg-[#FCFAF4] text-slate-900 pb-20 sm:pb-28 px-4 sm:px-8 border-b border-slate-200/80">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
          {/* Left Column: 4 Vertical Feature Cards (7 Cols - Frame 00:05 - 00:06) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {privateCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-2 hover:border-slate-300 transition-all"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mb-2" />
                <h3 className="text-base font-bold text-slate-900 font-display">
                  {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Copy & Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display leading-[1.15]">
              Ready for your sanctuary.{" "}
              <span className="text-emerald-700">Private by design.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Calm Me runs cleanly in the browser, protecting your reflections with client-level encryption
              so you can record your true burnout symptoms without fear of workplace surveillance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0a1b10] hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                <span>Open Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#faq"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
              >
                Read Privacy FAQ
              </a>
            </div>

            {/* Peaceful Dino in the Fire Artwork (Cover position, clean with no text) */}
            <div className="pt-2">
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white max-w-sm group">
                <img
                  src={assets.peace_dino}
                  alt="Calm in the Fire · Developer Mental Peace"
                  className="w-full h-52 sm:h-60 object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternPrivateCards;

