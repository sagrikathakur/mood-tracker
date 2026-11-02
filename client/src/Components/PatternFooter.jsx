import React from "react";
import { Link } from "react-router-dom";
import { Heart, Code2 } from "lucide-react";
import assets from "../assets/asset";
import {
  PixelFox,
  PixelOwl,
  PixelBear,
  PixelPenguin,
  PixelCat,
  PixelFrog,
} from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import PixelDither from "./PixelDither";

export const PatternFooter = () => {
  return (
    <footer className="w-full bg-[#080e0a] text-white relative">
      {/* Top Pixel Dither from Lime Green to Black (Matches Frame 00:11) */}
      <PixelDither topColor="#64DC4C" bottomColor="#080e0a" height={28} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-16 space-y-12">
        {/* Brand & Mission Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-emerald-950/80 pb-8 text-center sm:text-left">
          <div className="flex items-center gap-3.5">
            <img
              src={assets.logo}
              alt="Calm Me"
              className="h-10 w-auto object-contain"
            />
            <div>
              <span className="text-xl font-black text-white font-display tracking-tight block">
                Calm Me
              </span>
              <p className="text-xs text-emerald-300/70 font-normal">
                Developer burnout tracker & sanctuary — designed & developed by Sagrika.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#64DC4C] font-semibold bg-emerald-950/60 px-4 py-1.5 rounded-full border border-emerald-800/40">
            <Code2 className="w-4 h-4" />
            <span>Built by Developers, for Developers</span>
          </div>
        </div>

        {/* Link Directory (Matches Kizupi footer links) */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-3 text-xs text-emerald-200/70 font-medium">
          <Link to="/" onClick={() => sounds.playClick()} className="hover:text-white transition">
            About Calm Me
          </Link>
          <a href="#about" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Sagrika&apos;s Story
          </a>
          <Link to="/tracker" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Dashboard
          </Link>
          <Link to="/journal" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Daily Journal
          </Link>
          <Link to="/mood" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Mood Tracker
          </Link>
          <Link to="/calendar" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Mood Calendar
          </Link>
          <Link to="/analytics" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Burnout Analytics
          </Link>
          <Link to="/wellness" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Paced Breathing
          </Link>
          <Link to="/habits" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Screen Time & Sleep
          </Link>
          <Link to="/settings" onClick={() => sounds.playClick()} className="hover:text-white transition">
            Sanctuary PIN Lock
          </Link>
          <a href="#faq" onClick={() => sounds.playClick()} className="hover:text-white transition">
            FAQ
          </a>
        </div>

        {/* Row of Cute Pixel Character Companions (Matches Frame 00:11 - 00:12) */}
        <div className="pt-6 border-t border-emerald-950/80 flex flex-col items-center gap-6">
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            <PixelFox className="w-10 h-10 opacity-90" />
            <PixelOwl className="w-10 h-10 opacity-90" />
            <PixelBear className="w-10 h-10 opacity-90" />
            <PixelPenguin className="w-10 h-10 opacity-90" />
            <PixelCat className="w-10 h-10 opacity-90" />
            <PixelFrog className="w-10 h-10 opacity-90" />
          </div>

          {/* Copyright & Disclaimer */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-emerald-400/60 text-center sm:text-left">
            <span>
              &copy; {new Date().getFullYear()} Calm Me. Designed & Developed by Sagrika.
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300/80">
              <span>Engineered with care for software engineers</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PatternFooter;

