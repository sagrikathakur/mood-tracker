import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Code2 } from "lucide-react";
import assets from "../assets/asset";
import { sounds } from "../utils/soundEffects";

const SleekFooter = () => {
  return (
    <footer className="w-full bg-slate-950 text-white py-14 px-4 sm:px-8 border-t border-slate-800">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Top Brand Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-8 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img
              src={assets.logo}
              alt="Calm Me"
              className="h-9 w-auto object-contain"
            />
            <div>
              <span className="text-base font-extrabold text-white tracking-tight font-display block">
                Calm Me
              </span>
              <span className="text-xs text-slate-400 font-normal">
                Developer mental wellness & burnout tracker — designed & developed by Sagrika.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
            <Code2 className="w-3.5 h-3.5" />
            <span>Built by Developers, for Developers</span>
          </div>
        </div>

        {/* Link Directory */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 text-xs text-slate-400 font-medium">
          <Link to="/" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Home
          </Link>
          <a href="#about" onClick={() => sounds.playClick()} className="hover:text-white transition">
            About Calm Me
          </a>
          <Link to="/tracker" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Dashboard
          </Link>
          <Link to="/journal" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Dev Journal
          </Link>
          <Link to="/calendar" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Mood Calendar
          </Link>
          <Link to="/analytics" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Burnout Analytics
          </Link>
          <Link to="/wellness" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Calming Tools
          </Link>
          <Link to="/habits" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Habits & Screen Time
          </Link>
          <Link to="/settings" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Settings & PIN
          </Link>
          <a href="#faq" onClick={() => sounds.playClick()} className="hover:text-white transition">
            FAQ
          </a>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-900 gap-2">
          <span>&copy; {new Date().getFullYear()} Calm Me. Designed & Developed by Sagrika. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <span>Engineered with care for software developers</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </span>
        </div>
      </div>
    </footer>
  );
};

export default SleekFooter;
