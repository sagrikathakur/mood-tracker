import React, { useState } from "react";
import { ChevronDown, HelpCircle, Shield, Sparkles, Smile } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Is my personal journal completely private?",
    a: "Yes, 100%. Your journal entries, uploaded photos, and chosen moods are tied exclusively to your authenticated account with JWT and bcrypt security. They are never shared publicly or visible to other users.",
  },
  {
    q: "How often should I record my mood?",
    a: "Even once a day is plenty! Many people like checking in during the evening to reflect on their day, or in the morning to set their daily intention. Logging consistently helps unlock your emotional rhythm over the week.",
  },
  {
    q: "Can I add stickers and photos to past entries?",
    a: "Absolutely! You can choose any past date on the calendar, or tap the Edit button on any entry in your timeline to attach new stickers, update your notes, or edit your mood.",
  },
  {
    q: "How do streaks work?",
    a: "Your streak counts consecutive days where you logged at least one journal entry. If you log today or yesterday, your streak stays alive and keeps you motivated to maintain a mindful self-care habit.",
  },
  {
    q: "Does Mood Tracker diagnose medical conditions?",
    a: "No. Mood Tracker is designed for personal mindfulness, self-reflection, and creative journaling. It helps you notice your own feelings without medical judgment or diagnosis.",
  },
];

const WellnessFAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-16 scroll-mt-24">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl shadow-slate-200/40">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            <HelpCircle className="w-3.5 h-3.5" />
            Common Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Everything you need to know about journaling, privacy, and mood tracking.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left font-bold text-sm sm:text-base text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal bg-slate-50/50 animate-in fade-in duration-150">
                    {item.a}
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

export default WellnessFAQ;
