import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import PatternFooter from "../Components/PatternFooter";
import assets from "../assets/asset";
import aboutPageBg from "../assets/about-page-background.jpg";
import {
  Gamepad2,
  Heart,
  ShieldCheck,
  Lock,
  Activity,
  ArrowRight,
  ArrowDown,
  MessageCircle,
  Video,
  EyeOff,
} from "lucide-react";
import { PixelCloud } from "../Components/PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";

// 6 Core Sanctuary Services
const CORE_SERVICES = [
  {
    icon: Activity,
    category: "Self-Discovery",
    iconBg: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
    title: "Mood & Energy Tracker",
    desc: "Check in with your feelings in seconds. Correlates sleep duration, daily routines, and emotional shifts with zero broken-streak guilt.",
    link: "/tracker",
    linkText: "Explore Tracker",
  },
  {
    icon: Gamepad2,
    category: "Playful Relief",
    iconBg: "bg-purple-50 text-purple-800 border-purple-200/80",
    title: "Anxiety Calming Games",
    desc: "Tactile, sensory mini games engineered to quiet racing thoughts, melt acute physical tension, and ground your attention when panic strikes.",
    link: "/game",
    linkText: "Play Calming Games",
  },
  {
    icon: MessageCircle,
    category: "Peer Support",
    iconBg: "bg-sky-50 text-sky-800 border-sky-200/80",
    title: "Chat a Friend",
    desc: "A warm, compassionate space to connect in real-time. Share what's on your mind with trusted peers who listen without judgment or pretense.",
    link: "/chatafriend",
    linkText: "Chat with a Friend",
  },
  {
    icon: Video,
    category: "Virtual Zen",
    iconBg: "bg-amber-50 text-amber-800 border-amber-200/80",
    title: "Virtual Zen Rooms (Meet)",
    desc: "Serene WebRTC video and audio spaces with calm ambient soundscapes for mindful co-presence, quiet study, or peaceful group pauses.",
    link: "/meet",
    linkText: "Enter Zen Room",
  },
  {
    icon: Lock,
    category: "Confidential Vault",
    iconBg: "bg-rose-50 text-rose-800 border-rose-200/80",
    title: "PIN-Locked Private Journal",
    desc: "A hardware-secured vault for honest reflections protected by a 4-digit PIN lock. 100% client-side encryption that never touches the cloud.",
    link: "/tracker",
    linkText: "Open Private Journal",
  },
  {
    icon: Heart,
    category: "Nervous System Care",
    iconBg: "bg-teal-50 text-teal-800 border-teal-200/80",
    title: "Sensory Resets & Calm",
    desc: "Evidence-based somatic exercises and mindful pauses to ease sensory overload, break acute stress loops, and restore calm in minutes.",
    link: "/game",
    linkText: "Try Sensory Resets",
  },
];

const About = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ============================================================ */}
        {/* HERO: USER'S ADDED ABOUT-PAGE-BACKGROUND (Full width, 100vh height, Transparent Glass Hero with Heading & Buttons) */}
        {/* ============================================================ */}
        <section className="relative w-full h-screen min-h-[100dvh] overflow-hidden flex flex-col justify-between items-center text-center px-4 sm:px-8 pt-28 sm:pt-36 pb-8 select-none shadow-none">
          {/* Canopy Background Image: Full width, 100vh height, in front of background, NO dark shadow */}
          <img
            src={aboutPageBg}
            alt="CalmTREE Sanctuary Canopy"
            className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
          />

          {/* Centered Transparent Glass Hero Card (Heading, Text & Buttons) */}
          <div className="relative z-10 max-w-2xl mx-auto my-auto space-y-5 px-6 sm:px-10 py-8 sm:py-10 rounded-3xl bg-white/75 backdrop-blur-md border border-white/85 shadow-md animate-in fade-in duration-300">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/85 text-emerald-950 text-xs font-bold border border-white/90 shadow-2xs">
              Welcome to CalmTREE
            </span>

            <h1 className="text-3xl sm:text-5xl font-serif font-black text-slate-950 tracking-tight leading-[1.15]">
              A quiet place to{" "}
              <span className="italic text-emerald-900">catch your breath.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium max-w-lg mx-auto">
              An honest, judgment-free mental sanctuary created for everyday people navigating stress and burnout. 100% private, zero streak guilt, and free forever.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#why-us"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-950 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <span>Why CalmTREE?</span>
                <ArrowDown className="w-4 h-4 text-emerald-400" />
              </a>

              <Link
                to="/game"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-950 text-xs sm:text-sm font-bold border border-slate-300/80 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-purple-700" />
                <span>Play Calming Game</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 1. FIRST: WHY US (Purpose & Philosophy) */}
        {/* ============================================================ */}
        <section
          id="why-us"
          className="relative w-full bg-[#EAF5E7] px-6 sm:px-12 lg:px-16 pt-20 sm:pt-28 pb-16 sm:pb-24 overflow-hidden border-b border-emerald-900/10"
        >
          <div className="absolute top-10 right-16 opacity-30 pointer-events-none hidden md:block">
            <PixelCloud className="w-28 h-14" />
          </div>

          <div className="max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-semibold border border-emerald-200/60">
              Why CalmTREE?
            </span>

            <h1 className="text-3xl sm:text-5xl font-serif text-slate-900 tracking-tight leading-[1.2]">
              A sanctuary built for{" "}
              <span className="italic text-emerald-800">genuine peace of mind.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Most wellness apps feel like clinical diagnostic forms, workplace monitors, or ad-filled subscription traps that guilt you with broken-streak counters. CalmTREE was created as an honest, private space for everyday people to decompress, heal, and find their center.
            </p>

            {/* 3 Simple "Why Us" Value Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">100% Private</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Your journal entries and mood logs are encrypted locally on your device. Zero data brokers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">No Streak Guilt</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  We never punish you for taking time away. Rest is an essential human rhythm, not a failure.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-2xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center border border-sky-100">
                  <EyeOff className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">Zero Ads or Tracking</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Completely free of advertising trackers, social feed algorithms, and commercial pressure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 2. SERVICES WE PROVIDE (Clean, Spacious Sanctuary Cards) */}
        {/* ============================================================ */}
        <section className="w-full bg-[#FAF8F5] border-b border-stone-200/70 py-20 sm:py-28 px-6 sm:px-12 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
            <div className="text-center space-y-3 max-w-2xl mx-auto">
              <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-950 text-xs font-semibold border border-emerald-200/80 shadow-2xs">
                Sanctuary Services
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display leading-[1.15]">
                Everything you need to <span className="text-emerald-800">restore calm.</span>
              </h2>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                Evidence-based tools designed to soothe overthinking, release acute physical stress, and help you find steady emotional balance on your own terms.
              </p>
            </div>

            {/* 6 Elegant, Spacious White Sanctuary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {CORE_SERVICES.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white hover:bg-[#FCFAF7] border border-slate-200/90 hover:border-emerald-700/30 rounded-3xl p-7 sm:p-8 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-xs hover:shadow-md group"
                  >
                    <div className="space-y-4">
                      {/* Icon & Category */}
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs ${service.iconBg}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {service.category}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display group-hover:text-emerald-900 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-2">
                          {service.desc}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Link */}
                    <div className="pt-2 border-t border-slate-100">
                      <Link
                        to={service.link}
                        onClick={() => sounds.playClick()}
                        className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 hover:text-emerald-700 transition-all group-hover:translate-x-1"
                      >
                        <span>{service.linkText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* 4. LAST CTA (Matching Image 2 with Pills & Action Buttons) */}
        {/* ============================================================ */}
        <section className="w-full bg-[#90D786] text-slate-950 py-18 sm:py-24 px-6 sm:px-12 lg:px-16 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Heading & Subtitle */}
            <div className="space-y-3 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-950 tracking-tight leading-tight">
                Ready for a calmer, quieter mind?
              </h2>
              <p className="text-xs sm:text-sm text-slate-800 max-w-md mx-auto font-medium leading-relaxed">
                Take a slow, deep breath. Your personal sanctuary is waiting whenever you need a peaceful moment.
              </p>
            </div>

            {/* Big Action Buttons (Matching Image 2) */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-black text-white text-xs sm:text-sm font-bold shadow-md hover:bg-slate-900 transition active:scale-95"
              >
                <span>Enter Sanctuary Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/game"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-slate-900 text-xs sm:text-sm font-bold shadow-xs hover:bg-slate-50 border border-black/10 transition active:scale-95"
              >
                <Gamepad2 className="w-4 h-4 text-purple-700" />
                <span>Play Calming Game</span>
              </Link>
            </div>

            <p className="text-xs text-slate-700/80 pt-4 font-medium">
              100% Free · Client-Encrypted · Zero Tracking · Built with care
            </p>
          </div>
        </section>
      </main>

      <PatternFooter />
    </div>
  );
};

export default About;
