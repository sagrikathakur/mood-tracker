import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import PatternFooter from "../Components/PatternFooter";
import assets from "../assets/asset";
import {
  Code2,
  Terminal,
  Cpu,
  Flame,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Lock,
  EyeOff,
  Zap,
  Activity,
  ArrowRight,
} from "lucide-react";
import {
  PixelCloud,
  PixelPineTree,
  PixelOwl,
} from "../Components/PixelCharacters";
import { sounds } from "../utils/soundEffects";
import { useAuth } from "../context/AuthContext";
import { motion } from "../utils/motion";

const About = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 4 Alternating Feature Rows: Image + Text -> Text + Image -> Image + Text -> Text + Image
  const problemPillars = [
    {
      id: "debugging",
      step: "01",
      tag: "Late-Night Debugging",
      tagColor: "bg-amber-100/90 text-amber-950 border-amber-300/80",
      badge: "☕ 2 AM Alert Monitor",
      icon: Terminal,
      title: "Late-Night Debugging & Sprint Crunch",
      subtitle: "Surrounded by 30 empty mugs, a glowing IDE, and broken test suites.",
      desc: "Software developers routinely push through high-cortisol sprints, on-call alert fatigue, and broken pipelines at 2 AM. When release deadlines loom, our nervous system gets trapped in fight-or-flight mode, draining cognitive stamina and causing severe tunnel vision.",
      bullets: [
        "Identifies when prolonged debugging causes cognitive tunnel-vision and diminishing returns.",
        "Logs late-night cortisol spikes and on-call paging fatigue without judgmental streak penalties.",
        "Gives you an objective, guilt-free signal when it is time to close the IDE and sleep.",
      ],
      img: assets.burnout_cat,
      alt: "Late Night Coffee & Debugging Cat",
      imageBg: "bg-[#0f1d14]",
      accentBorder: "border-amber-500/30",
    },
    {
      id: "context-switching",
      step: "02",
      tag: "Cognitive Overload",
      tagColor: "bg-sky-100/90 text-sky-950 border-sky-300/80",
      badge: "💻 Attention Fragmentation",
      icon: Cpu,
      title: "Context-Switching & Attention Splintering",
      subtitle: "Jumping between 20 browser tabs, Slack DMs, Jira tickets, and GitHub PRs.",
      desc: "Writing production software demands massive working memory cache. Jumping between urgent Slack threads, PR reviews, unblocking teammates, and debugging fragments your mental state, leaving you exhausted by mid-afternoon even if few commits shipped.",
      bullets: [
        "Quantifies daily context switches and attention drag across dev tools and communications.",
        "Flags flow-state disruption before mental stamina bottoms out and brain fog sets in.",
        "Shields 2-hour uninterrupted deep focus blocks with gentle boundary reminders.",
      ],
      img: assets.retro_pc,
      alt: "90s Aesthetic Dev Machine with Sticky Notes",
      imageBg: "bg-[#181124]",
      accentBorder: "border-sky-500/30",
    },
    {
      id: "correlation",
      step: "03",
      tag: "Sprint Pressure",
      tagColor: "bg-rose-100/90 text-rose-950 border-rose-300/80",
      badge: "🔥 Root-Cause Analytics",
      icon: Flame,
      title: "Burnout Root-Cause Correlation",
      subtitle: "The backlog is burning, but your nervous system can remain centered.",
      desc: "Engineers often internalize exhaustion as personal inadequacy or imposter syndrome. Calm Me analyzes the real biological variables: uninterrupted screen hours, sleep deficit, and caffeine spikes to reveal the true culprits without shame.",
      bullets: [
        "Separates true biological exhaustion from late-night imposter syndrome.",
        "Correlates uninterrupted screen glare, sleep duration, and emotional baselines.",
        "Delivers weekly plain-English recovery summaries with zero broken-streak guilt.",
      ],
      img: assets.peace_dino,
      alt: "Calm in the Fire - Dino standing peaceful while papers burn",
      imageBg: "bg-[#1f160e]",
      accentBorder: "border-rose-500/30",
    },
    {
      id: "recovery",
      step: "04",
      tag: "Nervous System Reset",
      tagColor: "bg-emerald-100/90 text-emerald-950 border-emerald-300/80",
      badge: "🍵 60-Second Micro-Resets",
      icon: Heart,
      title: "Guilt-Free Restorative Recovery",
      subtitle: "Warm chamomile tea, quiet solitude, cozy socks, and zero productivity guilt.",
      desc: "Developers don't need fluffy platitudes—we need fast, evidence-based micro-resets engineered for technical minds. Built-in 60-second breathing protocols and sensory grounding routines recalibrate your nervous system between pull requests.",
      bullets: [
        "4-4-4-4 Box Breathing lowers sympathetic heart rate and cortisol in 90 seconds.",
        "5-4-3-2-1 Sensory Grounding breaks through deep IDE tunnel vision.",
        "Reinforces that resting is an essential, high-leverage software engineering skill.",
      ],
      img: assets.taking_edge_off,
      alt: "Taking the Edge Off - Cozy Tea and Rest",
      imageBg: "bg-[#091b10]",
      accentBorder: "border-emerald-500/30",
    },
  ];

  // Ethical Architecture Guarantees
  const engineeringPrinciples = [
    {
      icon: EyeOff,
      title: "Zero Corporate Surveillance",
      desc: "Never tied to employer emails, company Slack channels, or HR performance metrics. Your baseline logs and journals belong exclusively to you.",
    },
    {
      icon: Lock,
      title: "100% Client-Side Privacy",
      desc: "Your wellness records are stored safely on your machine with optional instant 4-digit PIN locking. No third-party data broker access.",
    },
    {
      icon: Activity,
      title: "No Streak-Shaming Algorithms",
      desc: "We never penalize missed days with toxic streak counters or guilt notifications. Resting is a vital engineering skill, not a sprint failure.",
    },
    {
      icon: Zap,
      title: "Full Data Sovereignty",
      desc: "One-click complete JSON backup export and instant permanent purge. Zero marketing trackers, zero ad pixels, zero telemetry profiling.",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FCFAF4] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      {/* Global Transparent Navbar */}
      <Navbar />

      <main className="flex-1 w-full pt-16 sm:pt-20">
        {/* =========================================================================
            1. VIBRANT MEADOW HERO SECTION (Atmospheric Green, Pixel Clouds & Trees, Duck Mascot)
           ========================================================================= */}
        <section className="relative w-full bg-[#90D786] border-b border-emerald-950/20 pt-16 sm:pt-24 pb-20 sm:pb-28 px-6 sm:px-12 lg:px-16 overflow-hidden">
          {/* Animated Pixel Clouds & Pine Trees Across Full Viewport */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute top-10 left-8 sm:left-16 opacity-75 animate-cloud-drift-slow">
              <PixelCloud className="w-24 h-12 sm:w-32 sm:h-16" />
            </div>
            <div className="absolute top-14 right-10 sm:right-24 opacity-65 animate-cloud-drift-fast">
              <PixelCloud className="w-28 h-14 sm:w-36 sm:h-18" />
            </div>
            <div className="absolute bottom-6 left-10 opacity-40 hidden md:block">
              <PixelPineTree className="w-12 h-20" />
            </div>
            <div className="absolute bottom-6 right-12 opacity-40 hidden md:block">
              <PixelPineTree className="w-14 h-24" />
            </div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-7">
            {/* Friendly Greeting Mascot: Hi Duck */}
            <div className="flex flex-col items-center">
              <motion.div
                whileHover={{ scale: 1.08, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-3 border-emerald-950/25 shadow-2xl bg-white mb-3 cursor-pointer group"
                onClick={() => sounds.playPop(520)}
                title="Hi from Sagrika & Calm Me!"
              >
                <img
                  src={assets.hi_duck}
                  alt="Hi from Sagrika & Calm Me"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </motion.div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight font-display leading-[1.12]">
              Engineering calm in a{" "}
              <span className="text-[#134e27] underline decoration-[#134e27]/30 decoration-wavy underline-offset-8">
                high-stress tech world.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-900 font-medium max-w-3xl mx-auto leading-relaxed">
              Hi, I&apos;m <strong className="text-slate-950 font-bold">Sagrika</strong>—a full-stack developer and UX designer.
              I built <strong className="text-slate-950 font-bold">Calm Me</strong> because modern developer culture routinely glorifies late-night hustle, while ignoring the severe cognitive exhaustion of chronic tech burnout.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                to={isAuthenticated ? "/tracker" : "/login"}
                onClick={() => sounds.playClick()}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#0a1b10] hover:bg-black text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-black/15 hover:scale-102 transition-all cursor-pointer"
              >
                <span>Open Sanctuary Tracker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/"
                onClick={() => sounds.playClick()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/90 hover:bg-white text-slate-900 text-xs sm:text-sm font-extrabold border border-emerald-900/20 shadow-xs hover:scale-102 transition-all cursor-pointer"
              >
                Homepage
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. CREATOR STORY: Full-Width Split Editorial Section
           ========================================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65 }}
          className="w-full bg-white border-b border-slate-200/80 py-18 sm:py-24 px-6 sm:px-12 lg:px-16"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column (5 cols): Dual Portrait Visuals */}
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-row gap-5 justify-center items-center">
                {/* Visual 1: Focused Dev (Simple cover image, no text) */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative w-44 h-52 sm:w-48 sm:h-60 rounded-3xl overflow-hidden border-2 border-emerald-600/30 shadow-2xl group bg-[#091b10] shrink-0"
                >
                  <img
                    src={assets.working_dev}
                    alt="Sagrika Coding at Desk"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                {/* Visual 2: Chill Cat (Simple cover image, no text) */}
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="relative w-44 h-52 sm:w-48 sm:h-60 rounded-3xl overflow-hidden border-2 border-sky-500/30 shadow-2xl group bg-[#102436] shrink-0 sm:translate-y-4 lg:translate-y-6"
                >
                  <img
                    src={assets.chill_cat}
                    alt="Chill Cat with Sunglasses"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>
              </div>

              {/* Right Column (7 cols): Bio & Personal Manifesto */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 font-display tracking-tight">
                  Why I Built Calm Me
                </h2>

                <blockquote className="text-base sm:text-lg text-slate-700 italic leading-relaxed border-l-4 border-emerald-500/60 pl-5">
                  &ldquo;As engineers, we build sophisticated monitoring stacks for every microservice, database query, and API latency—yet we have zero tooling to monitor our own nervous system. I created Calm Me to give software developers a private, compassionate, and stigma-free sanctuary to track fatigue, defend their sleep, and recover focus.&rdquo;
                </blockquote>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  In fast-paced engineering teams, stepping away from the IDE often comes with subtle guilt or anxiety about PR turnaround times. Calm Me reframes recovery not as an absence of productivity, but as the essential prerequisite for sustainable software engineering.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <span className="flex items-center gap-2 bg-emerald-50 text-emerald-950 px-4 py-2 rounded-full border border-emerald-200/80 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    100% Client-Side Privacy
                  </span>
                  <span className="flex items-center gap-2 bg-slate-100 text-slate-900 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold">
                    <Code2 className="w-4 h-4 text-slate-700" />
                    Crafted by Sagrika Thakur
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            3. RUBBER DUCK PRINCIPLE: Full-Width Soft Sky/Pastel Section
           ========================================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65 }}
          className="w-full bg-gradient-to-b from-sky-50/70 via-blue-50/40 to-[#FCFAF4] border-b border-slate-200/80 py-18 sm:py-24 px-6 sm:px-12 lg:px-16"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              {/* Left Column (4 cols): Duck Mascot with Pixel Prompt */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: -2 }}
                  className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-3 border-blue-400/40 bg-[#0047AB] shadow-2xl group cursor-pointer"
                  onClick={() => sounds.playPop(480)}
                >
                  <img
                    src={assets.confused_duck}
                    alt="The Rubber Duck Principle"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 text-blue-900 text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    ???
                  </div>
                </motion.div>
              </div>

              {/* Right Column (8 cols): The Philosophy */}
              <div className="lg:col-span-8 space-y-5 text-left">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-950 font-display tracking-tight">
                  A safe sanctuary to talk through the mental &ldquo;???&rdquo;
                </h2>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  Every programmer knows the ritual of <strong>Rubber Duck Debugging</strong>: when code makes no sense, you explain each line out loud to an inanimate yellow duck until the solution clicks.
                </p>

                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  Calm Me applies that exact principle to your emotional nervous system. When on-call alarms, failing test suites, and 50 unread Slack threads leave your brain overwhelmed with &ldquo;???&rdquo;, you need a non-judgmental space to unload your thoughts, log your baseline, and step back without being evaluated.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs"
                  >
                    <span className="text-xs font-bold text-blue-900 block mb-1">01. Unfiltered Venting</span>
                    <p className="text-xs text-slate-600">Journal free-form thoughts behind a numerical PIN lock.</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs"
                  >
                    <span className="text-xs font-bold text-blue-900 block mb-1">02. Cognitive Untangling</span>
                    <p className="text-xs text-slate-600">Map caffeine spikes, screen hours, and emotional dips.</p>
                  </motion.div>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs"
                  >
                    <span className="text-xs font-bold text-blue-900 block mb-1">03. Reset Baseline</span>
                    <p className="text-xs text-slate-600">60-second sensory grounding before reopening your IDE.</p>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* =========================================================================
            4. THE PROBLEM WE ADDRESS: Beautiful Alternating Layout (Image + Text -> Text + Image)
           ========================================================================= */}
        <section className="w-full bg-[#FCFAF4] border-b border-slate-200/80 py-20 sm:py-28 px-6 sm:px-12 lg:px-16 overflow-hidden">
          <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto space-y-3"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 font-display tracking-tight leading-[1.15]">
                Why standard wellness apps don&apos;t work for tech minds
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                General wellness trackers assume a 9-to-5 desk job. They don&apos;t understand sprint crunches, on-call alert spikes, or the unique cognitive exhaustion of software development.
              </p>
            </motion.div>

            {/* Alternating Feature Rows with Scroll-Reveal Animations */}
            <div className="space-y-12 sm:space-y-16">
              {problemPillars.map((pillar, idx) => {
                const isImageLeft = idx % 2 === 0;
                const Icon = pillar.icon;

                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, y: 36 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.65, delay: idx * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-sm hover:shadow-md transition-all group"
                  >
                    {/* Visual Card Column (5 cols on desktop) */}
                    <div
                      className={`lg:col-span-5 flex justify-center ${isImageLeft ? "lg:order-1" : "lg:order-2"
                        }`}
                    >
                      <div
                        className={`relative w-full max-w-md aspect-4/3 sm:aspect-16/11 rounded-3xl overflow-hidden border-2 ${pillar.accentBorder} shadow-xl group-hover:scale-[1.02] transition-transform duration-500 ${pillar.imageBg}`}
                      >
                        <img
                          src={pillar.img}
                          alt={pillar.alt}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                        />
                      </div>
                    </div>

                    {/* Content Column (7 cols on desktop) */}
                    <div
                      className={`lg:col-span-7 space-y-4 text-left ${isImageLeft ? "lg:order-2" : "lg:order-1"
                        }`}
                    >
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border shadow-2xs ${pillar.tagColor}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>
                            {pillar.step} · {pillar.tag}
                          </span>
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 font-display tracking-tight leading-tight">
                        {pillar.title}
                      </h3>

                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                        {pillar.desc}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-2.5">
                        {pillar.bullets.map((bullet, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. ETHICAL ARCHITECTURE & PRIVACY GUARANTEES: Full-Width Clean White
           ========================================================================= */}
        <section className="w-full bg-white border-b border-slate-200/80 py-20 sm:py-28 px-6 sm:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto space-y-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto space-y-3"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 font-display tracking-tight">
                Built on ethical software engineering principles
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                How Calm Me guarantees that your mental health data remains 100% private, sovereign, and untouchable by corporate surveillance.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {engineeringPrinciples.map((principle, idx) => {
                const Icon = principle.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: idx * 0.08 }}
                    whileHover={{ y: -4 }}
                    className="bg-[#FCFAF4] rounded-3xl p-7 border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all space-y-4"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      {principle.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {principle.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. WARM CLOSING NOTE FROM SAGRIKA (Clean, No Loud Banner)
           ========================================================================= */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#FCFAF4] py-18 sm:py-24 px-6 sm:px-12 lg:px-16 text-slate-950 border-b border-slate-200/80"
        >
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 5 }}
                className="cursor-pointer"
                onClick={() => sounds.playPop(560)}
              >
                <PixelOwl className="w-14 h-14" />
              </motion.div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 font-display tracking-tight">
              Your worth isn&apos;t measured in story points.
            </h2>

            <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-xl mx-auto font-normal">
              Take a deep breath. Unclench your jaw. Step away from your monitor for two minutes.
              The code will still be there tomorrow, but your peace of mind is irreplaceable.
            </p>

            <p className="text-xs sm:text-sm font-bold text-emerald-900 pt-2">
              — Designed &amp; Developed with care by Sagrika Thakur
            </p>
          </div>
        </motion.section>
      </main>

      {/* Global Classic Multi-Column Footer */}
      <PatternFooter />
    </div>
  );
};

export default About;
