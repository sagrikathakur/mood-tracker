import React, { useState } from "react";
import { Quote, Sparkles, RefreshCw, Copy, Check, Heart, Compass } from "lucide-react";
import { toast } from "react-hot-toast";

const AFFIRMATIONS = [
  {
    text: "I do not have to control my thoughts. I simply have to stop letting them control me.",
    author: "Dan Millman",
    category: "Calm",
    theme: "from-teal-500 to-emerald-600",
  },
  {
    text: "Feelings are just visitors. Let them come and go without judging yourself.",
    author: "Mooji",
    category: "Mindfulness",
    theme: "from-cyan-500 to-blue-600",
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
    category: "Self-Love",
    theme: "from-rose-500 to-pink-600",
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    category: "Rest",
    theme: "from-indigo-500 to-purple-600",
  },
  {
    text: "Small daily journaling moments lead to massive internal peace over time.",
    author: "Mood Tracker Wisdom",
    category: "Gratitude",
    theme: "from-amber-500 to-orange-600",
  },
  {
    text: "Be gentle with yourself. You are doing the best you can in this very season.",
    author: "Mindful Living",
    category: "Gentleness",
    theme: "from-sky-500 to-indigo-600",
  },
];

const DailyInspiration = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = AFFIRMATIONS[currentIndex];

  const handleShuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${current.text}" — ${current.author}`);
    setCopied(true);
    toast.success("Affirmation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-12">
      <div className="relative overflow-hidden rounded-3xl bg-white/90 backdrop-blur-xl border border-slate-200/80 p-8 sm:p-10 shadow-xl shadow-slate-200/40">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Daily Affirmation & Reflection
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                A grounding quote to anchor your mindset today.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {current.category}
            </span>
            <button
              type="button"
              onClick={handleShuffle}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Next Affirmation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quote Card */}
        <div className="py-8 sm:py-10 text-center max-w-2xl mx-auto">
          <Quote className="w-8 h-8 text-indigo-400/40 mx-auto mb-4" />
          <p className="text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed tracking-tight italic">
            "{current.text}"
          </p>
          <span className="text-sm font-bold text-indigo-600 block mt-4 tracking-wide uppercase">
            — {current.author}
          </span>
        </div>

        {/* Actions Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied!" : "Copy Affirmation"}</span>
          </button>

          <a
            href="#tracker"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
          >
            <Compass className="w-4 h-4" />
            <span>Reflect on this in your journal &darr;</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default DailyInspiration;
