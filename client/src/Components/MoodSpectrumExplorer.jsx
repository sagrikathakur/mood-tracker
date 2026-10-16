import React, { useState } from "react";
import { Sparkles, Heart, Lightbulb, Compass, ArrowRight } from "lucide-react";
import { MOOD_OPTIONS } from "./JournalCreator";

const MOOD_CARE_TIPS = {
  Happy: {
    tip: "Savor this positive emotional energy. Share your smile or write down 3 things that made today special.",
    action: "Write a quick thank-you note or celebrate a personal milestone.",
    recommendedStickers: ["⭐", "🌸", "✨", "❤️"],
    prompt: "What specifically brought you joy today, and how can you invite more of it tomorrow?",
  },
  Calm: {
    tip: "Cherish this quiet peacefulness. It is your body's restorative resting baseline.",
    action: "Sip a warm herbal tea or take a 10-minute digital walk in nature.",
    recommendedStickers: ["🌙", "☕", "🌊", "🌿"],
    prompt: "What made your mind feel still and grounded today?",
  },
  Excited: {
    tip: "You have vibrant creative electricity right now! Channel it into something that lights you up.",
    action: "Brainstorm that new idea or take the first small step on a dream goal.",
    recommendedStickers: ["🚀", "🔥", "🤩", "🎉"],
    prompt: "What possibilities are thrilling you right now?",
  },
  Neutral: {
    tip: "A neutral day is an underrated peaceful gift. No highs or lows — just steady equilibrium.",
    action: "Enjoy an easy routine without pressure to be excessively productive.",
    recommendedStickers: ["☁️", "🎵", "🍵", "🌱"],
    prompt: "What ordinary, simple detail brought you quiet comfort today?",
  },
  Anxious: {
    tip: "Notice the anxiety as a temporary wave, not who you are. Focus on your immediate senses.",
    action: "Practice the 5-4-3-2-1 grounding technique: 5 things you see, 4 you feel, 3 you hear.",
    recommendedStickers: ["🫂", "🕊️", "🌧️", "🛡️"],
    prompt: "What thought is weighing on your chest, and can you let it go for just tonight?",
  },
  Sad: {
    tip: "Sadness deserves tenderness and respect. You don't need to 'fix' it right away.",
    action: "Wrap yourself in a cozy blanket and give yourself full permission to feel low.",
    recommendedStickers: ["💧", "🧸", "🕯️", "💙"],
    prompt: "What does your heart need most right now? A gentle hug, rest, or silence?",
  },
  Angry: {
    tip: "Anger points to an unmet need or a crossed boundary. Acknowledge the fire with curiosity.",
    action: "Write raw, uncensored thoughts on paper, or take a brisk 5-minute walk to vent tension.",
    recommendedStickers: ["⚡", "🌪️", "🥊", "🌋"],
    prompt: "What boundary was pushed today, and how can you calmly honor yourself?",
  },
  Tired: {
    tip: "Your nervous system is asking for rejuvenation. Productivity can wait; sleep cannot.",
    action: "Dim harsh overhead lights and do a 15-minute phone-free wind down before bed.",
    recommendedStickers: ["😴", "🛌", "🌙", "💤"],
    prompt: "What drained your energy today, and what gentle rest can replenish you?",
  },
};

const MoodSpectrumExplorer = () => {
  const [activeMood, setActiveMood] = useState("Calm");

  const currentMoodObj =
    MOOD_OPTIONS.find((m) => m.name === activeMood) || MOOD_OPTIONS[1];
  const advice = MOOD_CARE_TIPS[activeMood] || MOOD_CARE_TIPS.Calm;

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 my-16">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl shadow-slate-200/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-2">
              <Compass className="w-3.5 h-3.5" />
              Emotional Compass
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Your Emotional Spectrum
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Select any mood to see tailored self-care advice & gentle prompts.
            </p>
          </div>
        </div>

        {/* Mood Selector Bubbles */}
        <div className="flex flex-wrap gap-2.5 my-8">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = activeMood === mood.name;
            return (
              <button
                key={mood.name}
                type="button"
                onClick={() => setActiveMood(mood.name)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 scale-105"
                    : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="text-lg">{mood.emoji}</span>
                <span>{mood.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Mood Advice Showcase Card */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl sm:text-6xl p-3 bg-white rounded-3xl shadow-sm border border-slate-100">
              {currentMoodObj.emoji}
            </span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                When you feel {activeMood}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {currentMoodObj.desc}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Advice Item 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Self-Care Insight</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {advice.tip}
              </p>
            </div>

            {/* Advice Item 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Recommended Action</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {advice.action}
              </p>
            </div>
          </div>

          {/* Suggested Stickers & Prompt */}
          <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Matching Stickers:
              </span>
              <div className="flex items-center gap-1.5">
                {advice.recommendedStickers.map((s, i) => (
                  <span
                    key={i}
                    className="text-base p-1 rounded-lg bg-white border border-slate-200 shadow-2xs"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <a
              href="#tracker"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
            >
              <span>Log {activeMood} in your journal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoodSpectrumExplorer;
