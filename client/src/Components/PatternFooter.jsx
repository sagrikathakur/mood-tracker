import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Mail, ArrowRight, Heart } from "lucide-react";
import assets from "../assets/asset";
import {
  PixelFox,
  PixelOwl,
  PixelBear,
  PixelCat,
  PixelFrog,
} from "./PixelCharacters";
import { sounds } from "../utils/soundEffects";
import PixelDither from "./PixelDither";

export const PatternFooter = () => {
  return (
    <footer className="w-full bg-[#080e0a] text-white relative">
      {/* Top Pixel Dither Transition */}
      <PixelDither topColor="#64DC4C" bottomColor="#080e0a" height={24} />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-8 space-y-8">
        {/* Main Content: Brand & Simple Navigation */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 pb-8 border-b border-emerald-950/80 text-center md:text-left">
          {/* Brand Info */}
          <div className="space-y-3 max-w-sm">
            <Link
              to="/"
              onClick={() => sounds.playClick()}
              className="inline-flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <img
                  src={assets.logo}
                  alt="Calm Me"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-left">
                <span className="text-lg font-black text-white font-display tracking-tight block leading-none">
                  Calm Me
                </span>
                <span className="text-[11px] font-bold text-[#64DC4C] tracking-wide mt-1 block">
                  by Sagrika · Developer Sanctuary
                </span>
              </div>
            </Link>

            <p className="text-xs text-emerald-200/70 leading-relaxed font-normal">
              An honest, private sanctuary engineered to help tech minds decode chronic sprint fatigue and rebuild a healthy baseline without guilt.
            </p>

            <div className="inline-flex items-center gap-2 text-[11px] font-bold text-[#64DC4C] bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800/40">
              <ShieldCheck className="w-3.5 h-3.5 text-[#64DC4C]" />
              <span>100% Client-Side Encrypted</span>
            </div>
          </div>

          {/* Simple Navigation Links & Contact */}
          <div className="flex flex-col sm:flex-row items-center md:items-start gap-8">
            <div className="space-y-2.5 text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#64DC4C] font-display block">
                Quick Navigation
              </span>
              <ul className="space-y-2 text-xs text-emerald-200/80 font-medium">
                <li>
                  <Link
                    to="/"
                    onClick={() => sounds.playClick()}
                    className="hover:text-white hover:underline transition"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    onClick={() => sounds.playClick()}
                    className="hover:text-white hover:underline transition"
                  >
                    About Calm Me
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={() => sounds.playClick()}
                    className="hover:text-white hover:underline transition"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tracker"
                    onClick={() => sounds.playClick()}
                    className="hover:text-white hover:underline transition"
                  >
                    Tracker Sanctuary
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#64DC4C] font-display block">
                Direct Contact
              </span>
              <a
                href="mailto:sagrikathakur68@gmail.com"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-950/60 hover:bg-emerald-950 text-white border border-emerald-800/50 text-xs font-bold transition-all shadow-sm group cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-[#64DC4C]" />
                <span>sagrikathakur68@gmail.com</span>
                <ArrowRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <p className="text-[11px] text-emerald-300/60 max-w-[200px] mx-auto sm:mx-0">
                Created &amp; maintained by Sagrika Thakur.
              </p>
            </div>
          </div>
        </div>

        {/* Mascot Companions Row */}
        <div className="flex items-center justify-center gap-6 py-1">
          <PixelFox className="w-8 h-8 opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
          <PixelOwl className="w-8 h-8 opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
          <PixelBear className="w-8 h-8 opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
          <PixelCat className="w-8 h-8 opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
          <PixelFrog className="w-8 h-8 opacity-80 hover:opacity-100 hover:scale-110 transition-all cursor-pointer" />
        </div>

        {/* Bottom Copyright Bar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-400/60 text-center sm:text-left pt-4 border-t border-emerald-950/80">
          <span>
            &copy; {new Date().getFullYear()} Calm Me. Designed &amp; Developed with care by Sagrika Thakur.
          </span>
          <div className="flex items-center gap-1.5 text-emerald-300/70 font-medium">
            <span>Built for developers</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PatternFooter;
