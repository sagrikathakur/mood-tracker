import React, { useState } from "react";
import Navbar from "../Components/Navbar";
import Hero from "../Components/Hero";
import JournalCreator from "../Components/JournalCreator";
import MoodDashboard from "../Components/MoodDashboard";
import JournalHistory from "../Components/JournalHistory";
import GuidedCalm from "../Components/GuidedCalm";
import DailyInspiration from "../Components/DailyInspiration";
import MoodSpectrumExplorer from "../Components/MoodSpectrumExplorer";
import WellnessFAQ from "../Components/WellnessFAQ";
import WhyChooseUs from "../Components/WhyChooseUs";
import ServicesWeProvide from "../Components/ServicesWeProvide";
import WhyNeedCalm from "../Components/WhyNeedCalm";
import KizuCompanion from "../Components/KizuCompanion";
import { useAuth } from "../context/AuthContext";
import { Lock, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { sounds } from "../utils/soundEffects";
import { PixelOwl, PixelHeart } from "../Components/PixelIcons";

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAuthenticated, user } = useAuth();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#18181B] flex flex-col font-sans selection:bg-[#FFEAA7] selection:text-[#18181B]">
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-20 -mt-8 sm:-mt-12">
        {/* 1. Daily Affirmation & Reflection */}
        <DailyInspiration />

        {/* 2. Core Interactive Tracker (When Logged In) OR Private Sanctuary Lock Screen (When Guest) */}
        {isAuthenticated ? (
          <div className="animate-in fade-in duration-300">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4">
              <div className="pixel-card bg-white p-3.5 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00B894] animate-ping" />
                <span className="text-xs sm:text-sm font-['Bricolage_Grotesque'] font-bold text-[#18181B]">
                  Welcome back, <strong className="text-[#0984E3]">{user?.name}</strong>! Ready for today's check-in?
                </span>
              </div>
            </div>

            {/* Mood Analytics Dashboard */}
            <MoodDashboard refreshKey={refreshKey} />

            {/* Daily Mood & Journal Creator */}
            <JournalCreator onEntryCreated={handleRefresh} />

            {/* Journal History Timeline & Search */}
            <JournalHistory
              refreshKey={refreshKey}
              onEntryUpdated={handleRefresh}
            />

            {/* Interactive Pixel Companion */}
            <KizuCompanion currentMood="neutral" streak={5} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 my-12">
            {/* Private Sanctuary Callout Card */}
            <div className="pixel-card bg-white p-8 sm:p-12 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl border-3 border-[#18181B] bg-[#FFEAA7] flex items-center justify-center mx-auto shadow-[4px_4px_0px_#18181B]">
                <PixelOwl className="w-10 h-10" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 pixel-badge bg-[#55EFC4] text-[#18181B] text-xs font-['Silkscreen']">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  PRIVATE VAULT PROTECTION
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight font-['Bricolage_Grotesque']">
                  Your Thoughts Belong To You
                </h2>
                <p className="text-xs sm:text-sm text-[#18181B]/70 leading-relaxed font-medium">
                  Log your daily mood with our interactive pixel slider, preserve private reflections, track habit streaks, and unlock deep lifestyle correlations.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => sounds.playClick()}
                  className="pixel-btn pixel-btn-green w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-xs font-black uppercase cursor-pointer"
                >
                  <span>SIGN IN TO UNLOCK TRACKER</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  onClick={() => sounds.playClick()}
                  className="pixel-btn w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 text-xs font-black uppercase cursor-pointer"
                >
                  CREATE FREE ACCOUNT
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 3. Services We Provide */}
        <ServicesWeProvide />

        {/* 4. Why Choose Us? */}
        <WhyChooseUs />

        {/* 5. Why You Need Calm in Daily Life */}
        <WhyNeedCalm />

        {/* 6. Guided Calm & Breathwork Reset */}
        <GuidedCalm />

        {/* 7. Emotional Spectrum Self-Care Compass */}
        <MoodSpectrumExplorer />

        {/* 8. Frequently Asked Questions */}
        <WellnessFAQ />
      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t-2 border-[#18181B] py-10 px-4 text-center text-[#18181B]/70 text-xs sm:text-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-['Silkscreen'] font-bold text-[#18181B] text-base flex items-center gap-1.5">
              <span>🌿</span> MINDSPACE
            </p>
            <p className="text-[11px] font-['Silkscreen'] text-[#18181B]/50 mt-1">
              MINDFULNESS & NEURO-CORRELATION ENGINE
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-['Silkscreen'] text-[#18181B]">
            <a href="#services" className="hover:underline">SERVICES</a>
            <a href="#why-us" className="hover:underline">WHY US</a>
            <a href="#why-calm" className="hover:underline">CALM</a>
            <a href="#faq" className="hover:underline">FAQ</a>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-[#18181B]/15 text-[#18181B]/40 text-[10px] font-['Silkscreen']">
          &copy; {new Date().getFullYear()} MINDSPACE. INSPIRED BY KIZUPI PIXEL ART & RETRO WELLNESS.
        </div>
      </footer>
    </div>
  );
};

export default Home;
