import React, { useState } from "react";
import { ChevronDown, Sparkles, HelpCircle } from "lucide-react";
import { sounds } from "../utils/soundEffects";

const FAQS = [
  {
    q: "What is Calm Me and why was it made for developers?",
    a: "Calm Me is a mental wellness and burnout tracker designed specifically for software engineers, programmers, and tech creators. It bridges the gap between intense coding sprints and mental health, helping developers discover the exact causes of their burnout and restore calm.",
  },
  {
    q: "Who designed and developed Calm Me?",
    a: "Calm Me was designed and developed by Sagrika, a full-stack developer and UX designer. She built this sanctuary after recognizing that developers frequently debug complex distributed systems but rarely have tools to debug their own burnout.",
  },
  {
    q: "How does Calm Me help me track and prevent burnout?",
    a: "Calm Me lets you log your emotional baseline, screen time, sleep duration, and developer-specific triggers (like late-night debugging, sprint crunch, broken builds, or context switching). The Lifestyle Correlation Engine correlates these factors so you can see what drains your reserves.",
  },
  {
    q: "Is my journal data completely private?",
    a: "Yes. All journal entries and wellness records are client-encrypted. Your personal data is never sold, tracked, or used to train third-party AI models. You can also lock your screen instantly behind a 4-digit PIN.",
  },
  {
    q: "What calming tools are available when code stress spikes?",
    a: "Calm Me includes an interactive Box Breathing & 4-7-8 pacer, 5-4-3-2-1 sensory grounding, a silent meditation timer, and a daily Gratitude Jar designed to break anxiety loops in under 2 minutes.",
  },
  {
    q: "Can I export or permanently delete my data?",
    a: "Yes. You have full GDPR control to download a comprehensive JSON archive of your entire history, or permanently delete your account and all associated records with zero trace.",
  },
];

const SleekFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleAccordion = (idx) => {
    sounds.playClick();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-20 sm:py-28 px-4 sm:px-8 bg-white border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-display text-slate-900">
            Everything you need to know.
          </h2>
          <p className="text-xs sm:text-base text-slate-500 font-normal">
            Transparent answers about Calm Me, privacy, and developer mental wellness.
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 font-display">
                    {faq.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 bg-slate-100" : ""
                      }`}
                  >
                    <ChevronDown className="w-4 h-4 text-slate-600" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SleekFAQ;
