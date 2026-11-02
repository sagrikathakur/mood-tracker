import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { sounds } from "../utils/soundEffects";
import assets from "../assets/asset";

const FAQS = [
  {
    num: "01",
    q: "How much does it cost?",
    a: "Calm Me is 100% free. There are no paywalls, credit card requirements, hidden premium tiers, or annoying upsells.",
  },
  {
    num: "02",
    q: "What do I need to get started?",
    a: "Just your web browser. There are no app store downloads, extensions, or complex setup steps required.",
  },
  {
    num: "03",
    q: "Is it an automated chatbot?",
    a: "No. Calm Me is an authentic lifestyle correlation engine and developer sanctuary. It provides structured reflection questions and calming tools — it never pretends to be a medical doctor or diagnose mental health conditions.",
  },
  {
    num: "04",
    q: "How does it decode developer burnout?",
    a: "It correlates your daily coding hours, nightly sleep quality, and baseline mood with developer triggers (like late-night debugging, sprint crunch, merge conflicts, and broken builds).",
  },
  {
    num: "05",
    q: "Who designed and developed Calm Me?",
    a: "Calm Me was designed and developed by Sagrika, a full-stack software engineer and UX designer who recognized that developers have great tools to debug software, but none to debug their own burnout.",
  },
  {
    num: "06",
    q: "Is my journal safe from employer surveillance?",
    a: "Yes. All entries are client-encrypted and shielded behind a 4-digit numeric PIN. It is completely independent of corporate Slack or Jira workspaces.",
  },
  {
    num: "07",
    q: "Can I export or permanently delete my data?",
    a: "Yes. You have full GDPR control to download a comprehensive JSON archive of your entire history, or permanently wipe your account with zero trace.",
  },
  {
    num: "08",
    q: "What calming tools are included for mid-sprint resets?",
    a: "It includes an interactive Box Breathing pacer (4-4-4-4), a 4-7-8 parasympathetic sedative reset, 5-4-3-2-1 sensory grounding, and an evening Gratitude Jar.",
  },
];

const PET_LIST = [
  { id: "p-1", name: "Pixel Pup", img: assets.p1, sound: 440, anim: "animate-walk", delay: "0s" },
  { id: "p-2", name: "Pixel Dino", img: assets.p2, sound: 480, anim: "animate-walk-dino", delay: "0.45s" },
  { id: "p-3", name: "Sleeping Corgi", img: assets.p3, sound: 520, anim: "animate-walk-corgi", delay: "0.85s" },
  { id: "p-4", name: "Super Shiba", img: assets.p4, sound: 560, anim: "animate-walk-super", delay: "0.3s" },
];

export const PatternFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    sounds.playClick();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full bg-[#FCFAF4] text-slate-900 py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Sanctuary Pixel Pets (p-1, p-2, p-3, p-4) Walking Animations */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 py-2 select-none">
          {PET_LIST.map((pet) => (
            <div
              key={pet.id}
              className={`cursor-pointer transition-transform duration-200 hover:scale-120 active:scale-95 ${pet.anim}`}
              style={{ animationDelay: pet.delay }}
              onClick={() => sounds.playPop(pet.sound)}
              title={`${pet.name} · Walking in sanctuary`}
            >
              <img
                src={pet.img}
                alt={pet.name}
                className="h-12 sm:h-16 md:h-18 w-auto object-contain drop-shadow-xs"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          {/* Left Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display leading-[1.15]">
              The things developers ask first.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
              Calm Me is 100% free and open for developers. Something else on your mind?{" "}
              <a href="#about" className="text-emerald-700 underline font-semibold">
                Read Sagrika&apos;s story
              </a>
              .
            </p>
          </div>

          {/* Right Column: Numbered Accordion 01-08 (7 Cols - Matches Frame 00:07 - 00:08) */}
          <div className="lg:col-span-7 divide-y divide-slate-200 border-y border-slate-200">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    className="w-full flex items-center justify-between text-left py-1 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                        {faq.num}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                        {faq.q}
                      </span>
                    </div>

                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pt-2 pb-2 pl-9 pr-6 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PatternFAQ;

