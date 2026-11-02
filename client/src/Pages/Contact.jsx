import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import PatternFooter from "../Components/PatternFooter";
import {
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Clock,
  ArrowRight,
  User,
  HelpCircle,
  Bug,
  Lightbulb,
  HeartHandshake,
} from "lucide-react";
import {
  PixelCloud,
  PixelPineTree,
  PixelOwl,
  PixelFox,
  PixelFrog,
} from "../Components/PixelCharacters";
import { sounds } from "../utils/soundEffects";

const TOPICS = [
  { id: "feedback", label: "Product Feedback", icon: Sparkles },
  { id: "bug", label: "Report a Bug", icon: Bug },
  { id: "feature", label: "Feature Suggestion", icon: Lightbulb },
  { id: "hello", label: "Saying Hello", icon: HeartHandshake },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "feedback",
    message: "",
  });
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCopyEmail = () => {
    sounds.playPop(520);
    navigator.clipboard.writeText("sagrikathakur68@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    sounds.playClick();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      sounds.playCelebration();
    }, 600);
  };

  const handleResetForm = () => {
    sounds.playClick();
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      topic: "feedback",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-[#90D786] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      {/* 1. Global Navbar */}
      <Navbar />

      {/* Decorative Pixel Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-24 left-8 opacity-80 animate-pulse duration-1000">
          <PixelCloud className="w-24 h-12" />
        </div>
        <div className="absolute top-36 right-12 opacity-75 hidden sm:block">
          <PixelCloud className="w-28 h-14" />
        </div>
        <div className="absolute top-96 left-6 opacity-85 hidden md:block">
          <PixelPineTree className="w-10 h-16" />
        </div>
        <div className="absolute top-[520px] right-8 opacity-85 hidden md:block">
          <PixelPineTree className="w-10 h-16" />
        </div>
      </div>

      <main className="flex-1 w-full relative z-10 pt-28 sm:pt-36 pb-20 px-4 sm:px-8 max-w-6xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-emerald-900/20 text-emerald-950 text-xs font-bold shadow-2xs backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Direct Developer Sanctuary Line</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display leading-[1.12]">
            Contact Us
          </h1>

          <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
            Have feedback, bug reports, or questions about Calm Me? Reach out directly to lead designer and developer{" "}
            <strong className="text-slate-950 font-bold">Sagrika Thakur</strong>. Every message is received and reviewed personally.
          </p>
        </div>

        {/* 2-Column Main Contact Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info & Quick Actions (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Direct Email Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[5px_5px_0px_#0a1b10] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider font-display">
                      Direct Email
                    </h2>
                    <span className="text-[11px] font-bold text-emerald-800">
                      Primary Inbox
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Active
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between gap-2">
                <code className="text-xs sm:text-sm font-bold text-slate-900 select-all truncate">
                  sagrikathakur68@gmail.com
                </code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer shrink-0"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <a
                  href="mailto:sagrikathakur68@gmail.com"
                  onClick={() => sounds.playClick()}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#0a1b10] hover:bg-black text-white text-xs sm:text-sm font-extrabold shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Open Mail Client</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Creator Profile Box */}
            <div className="p-6 rounded-3xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[5px_5px_0px_#0a1b10] space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-emerald-950 text-white flex items-center justify-center font-black text-base shadow-sm">
                  ST
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950">Sagrika Thakur</h3>
                  <p className="text-xs font-semibold text-emerald-900">
                    Lead Designer &amp; Developer · Calm Me
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Calm Me was built to create an honest, compassionate sanctuary for developers dealing with burnout, on-call alert exhaustion, and high-cortisol sprint crunches. Feel free to reach out anytime.
              </p>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  Replies within 24–48 hours
                </span>
                <span className="font-extrabold text-emerald-900">India (IST)</span>
              </div>
            </div>

            {/* Privacy Guarantee Pill */}
            <div className="p-4 rounded-2xl bg-white/90 border border-emerald-900/20 backdrop-blur-md flex items-center gap-3 text-xs text-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>
                <strong className="font-bold text-slate-950">100% Client-Side Privacy:</strong> We never sell, track, or share your contact info. No marketing newsletters.
              </span>
            </div>

            {/* Friendly Mascot Companion */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <PixelFox className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
              <PixelOwl className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
              <PixelFrog className="w-10 h-10 hover:scale-110 transition-transform cursor-pointer" />
            </div>
          </div>

          {/* Right Column: Send A Message Interactive Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-[#FCFAF4] border-2 border-[#0a1b10] shadow-[6px_6px_0px_#0a1b10]">
              {submitted ? (
                <div className="text-center py-12 space-y-5 animate-in fade-in duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center mx-auto text-emerald-700 shadow-md">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-2xl font-black text-slate-950 font-display">
                      Message Received!
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      Thank you for contacting Calm Me, <strong className="text-slate-950 font-bold">{formData.name}</strong>. Sagrika will review your note and respond back to <span className="underline font-bold text-emerald-900">{formData.email}</span> shortly.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-bold text-xs sm:text-sm hover:bg-black transition cursor-pointer shadow-xs"
                    >
                      Send Another Note
                    </button>
                    <Link
                      to="/"
                      onClick={() => sounds.playClick()}
                      className="px-6 py-2.5 rounded-full bg-white text-slate-800 font-bold text-xs sm:text-sm border border-slate-300 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-900 font-display">
                      Direct Message
                    </span>
                    <h2 className="text-2xl font-black text-slate-950 font-display">
                      Send Sagrika a Note
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Fill out the fields below to get in touch.
                    </p>
                  </div>

                  {/* Topic Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                      Topic / Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TOPICS.map((t) => {
                        const Icon = t.icon;
                        const isSelected = formData.topic === t.id;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              sounds.playClick();
                              setFormData({ ...formData, topic: t.id });
                            }}
                            className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 text-xs font-bold transition-all cursor-pointer text-center ${
                              isSelected
                                ? "bg-emerald-950 text-white border-slate-950 shadow-[2px_2px_0px_#0a1b10]"
                                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[11px] leading-tight">{t.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name & Email Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Alex Rivera"
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-[#0a1b10] focus:outline-none text-xs sm:text-sm font-semibold text-slate-900 transition shadow-2xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="alex@example.com"
                        className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-[#0a1b10] focus:outline-none text-xs sm:text-sm font-semibold text-slate-900 transition shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Share your thoughts, suggestions, or burnout story..."
                      className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-[#0a1b10] focus:outline-none text-xs sm:text-sm font-medium text-slate-900 transition resize-none shadow-2xs leading-relaxed"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <a
                      href={`mailto:sagrikathakur68@gmail.com?subject=[Calm Me ${formData.topic}] Note from ${encodeURIComponent(formData.name || "Developer")}&body=${encodeURIComponent(formData.message || "")}`}
                      onClick={() => sounds.playClick()}
                      className="text-xs font-bold text-emerald-900 hover:text-emerald-950 underline underline-offset-4 cursor-pointer"
                    >
                      Prefer your native mail app? Click here →
                    </a>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-[#0a1b10] hover:bg-black text-white text-xs sm:text-sm font-black shadow-[3px_3px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer min-w-[160px]"
                    >
                      {isSubmitting ? (
                        <span>Sending note...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 3. Simple Clean Footer */}
      <PatternFooter />
    </div>
  );
};

export default Contact;

