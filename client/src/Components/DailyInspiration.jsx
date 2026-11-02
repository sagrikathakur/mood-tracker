import React, { useState } from "react";
import { Quote, Sparkles, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { sounds } from "../utils/soundEffects";
import { PixelStar, PixelOwl } from "./PixelIcons";

const AFFIRMATIONS = [
  {
    text: "I do not have to control my thoughts. I simply have to stop letting them control me.",
    author: "Dan Millman",
    category: "CALM",
  },
  {
    text: "Feelings are just visitors. Let them come and go without judging yourself.",
    author: "Mooji",
    category: "MINDFULNESS",
  },
  {
    text: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
    category: "SELF-LOVE",
  },
  {
    text: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
    category: "REST",
  },
  {
    text: "Small daily journaling moments lead to massive internal peace over time.",
    author: "Kizu Companion",
    category: "GRATITUDE",
  },
  {
    text: "Be gentle with yourself. You are doing the best you can in this very season.",
    author: "Mindful Living",
    category: "GENTLENESS",
  },
];

const DailyInspiration = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const current = AFFIRMATIONS[currentIndex];

  const handleShuffle = () => {
    sounds.playPop();
    setCurrentIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(`"${current.text}" — ${current.author}`);
    setCopied(true);
    toast.success("Affirmation copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-10">
      <div className="pixel-card p-6 sm:p-8 bg-[#FAF8F5]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#18181B]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border-2 border-[#18181B] bg-[#FFEAA7] flex items-center justify-center shadow-[2px_2px_0px_#18181B]">
              <Sparkles className="w-5 h-5 text-[#18181B]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#55EFC4] text-[#18181B] text-[10px] mb-1 font-['Silkscreen']">
                DAILY ANCHOR
              </div>
              <h3 className="text-xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
                Daily Affirmation & Mindset
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-['Silkscreen'] px-2.5 py-1 rounded bg-white text-[#18181B] border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]">
              {current.category}
            </span>
            <button
              type="button"
              onClick={handleShuffle}
              className="pixel-btn p-2 text-[#18181B] cursor-pointer"
              title="Next Affirmation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quote Card */}
        <div className="py-6 sm:py-8 text-center max-w-2xl mx-auto">
          <p className="text-lg sm:text-2xl font-black text-[#18181B] leading-relaxed font-['Bricolage_Grotesque'] italic mb-3">
            "{current.text}"
          </p>
          <span className="text-xs font-['Silkscreen'] text-[#0984E3] tracking-wider block">
            — {current.author}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t-2 border-[#18181B]/15 text-xs text-[#18181B]/60 font-['Silkscreen']">
          <span className="text-[10px]">
            CARD {currentIndex + 1} OF {AFFIRMATIONS.length}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="pixel-btn flex items-center gap-1.5 px-3 py-1 text-[10px] cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00B894]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED" : "COPY QUOTE"}</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default DailyInspiration;
