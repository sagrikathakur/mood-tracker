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
import { useAuth } from "../context/AuthContext";
import { Lock, Sparkles, ShieldCheck, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAuthenticated, user } = useAuth();

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-800">
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
            <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-4 text-center sm:text-left">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl py-3 px-6 shadow-sm inline-flex items-center gap-2 text-slate-700 text-sm font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  Welcome back, <strong className="text-slate-900">{user?.name}</strong>! Ready to check in with yourself today?
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
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 my-12">
            {/* Private Sanctuary Callout Card */}
            <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-indigo-100 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600 shadow-inner">
                <Lock className="w-8 h-8" />
              </div>

              <div className="max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Private & Encrypted Journal
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Your Thoughts Belong To You
                </h2>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                  Sign in or create a free account to log your daily mood, write personal reflections, decorate with stickers, and unlock your emotional wellness trends.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-xl hover:bg-indigo-600 transition-all duration-200 active:scale-95"
                >
                  <span>Sign In to Unlock Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-2xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors duration-200"
                >
                  Create New Account
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
      <footer className="w-full bg-white border-t border-slate-200/80 py-12 px-4 text-center text-slate-500 text-xs sm:text-sm">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="font-bold text-slate-800 text-base">🌿 Mood Tracker</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Mindfulness, self-reflection, and visual memories.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500">
            <a href="#services" className="hover:text-slate-900 transition">Services</a>
            <a href="#why-us" className="hover:text-slate-900 transition">Why Us</a>
            <a href="#why-calm" className="hover:text-slate-900 transition">Why Calm</a>
            <a href="#meditation" className="hover:text-slate-900 transition">Guided Calm</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-slate-100 text-slate-400 text-[11px]">
          &copy; {new Date().getFullYear()} Mood Tracker by Sagrika. Built with PERN Stack.
        </div>
      </footer>
    </div>
  );
};

export default Home;