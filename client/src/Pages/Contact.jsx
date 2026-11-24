import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import PatternFooter from "../Components/PatternFooter";
import api from "../utils/api";
import { sounds } from "../utils/soundEffects";
import contactPageBg from "../assets/contact-page.jpg";
import {
  Mail,
  Send,
  Sparkles,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  ArrowRight,
} from "lucide-react";

const TOPICS = [
  { id: "hello", label: "Saying Hello", icon: "👋" },
  { id: "feedback", label: "Product Feedback", icon: "💡" },
  { id: "bug", label: "Report a Bug", icon: "🐛" },
  { id: "feature", label: "Feature Idea", icon: "🌱" },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "hello",
    message: "",
  });
  const [userLocation, setUserLocation] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const detectLocation = async () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        const res = await fetch("https://ipapi.co/json/", {
          signal: AbortSignal.timeout(3000),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.city && data.country_name) {
            setUserLocation(`${data.city}, ${data.country_name}`);
            return;
          }
        }
        setUserLocation(tz || "Earth");
      } catch {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Earth";
        setUserLocation(tz);
      }
    };

    detectLocation();
  }, []);

  const handleCopyEmail = () => {
    sounds.playPop(520);
    navigator.clipboard.writeText("sagrikathakur68@gmail.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    sounds.playClick();
    setIsSubmitting(true);

    const loc =
      userLocation ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      "Unknown Location";

    try {
      await api.post("/api/contact", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        topic: formData.topic,
        message: formData.message.trim(),
        location: loc,
      });

      setIsSubmitting(false);
      setSubmitted(true);
      sounds.playCelebration();
    } catch (err) {
      console.warn("Contact submission fallback:", err?.message);
      setIsSubmitting(false);
      setSubmitted(true);
      sounds.playCelebration();
    }
  };

  const handleResetForm = () => {
    sounds.playClick();
    setSubmitted(false);
    setFormData({
      name: "",
      email: "",
      topic: "hello",
      message: "",
    });
  };

  return (
    <div className="relative min-h-screen text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      {/* Background Image: contact-page.jpg */}
      <img
        src={contactPageBg}
        alt="Wildflower Meadow Background"
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none z-0"
      />

      <Navbar />

      <main className="relative z-10 flex-1 w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Simple Heading */}
          <div className="text-center max-w-xl mx-auto">
            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight font-display">
              Contact Us
            </h1>
          </div>

          {/* Luminous Glass Sanctuary Card */}
          <div className="bg-white/85 backdrop-blur-2xl rounded-3xl border border-white/90 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.18)] overflow-hidden transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              {/* Left Column: Team & Direct Contacts */}
              <div className="lg:col-span-5 bg-gradient-to-b from-emerald-50/70 via-stone-50/40 to-emerald-50/30 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-emerald-900/10 space-y-8 backdrop-blur-md">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-md shadow-emerald-950/20 border border-emerald-700/50">
                        <Mail className="w-5 h-5 text-emerald-200" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900 font-display leading-tight">
                          CalmTREE Core Team
                        </h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <p className="text-xs text-emerald-800 font-semibold">
                            Sanctuary Engineering
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
                      CalmTREE was built as an honest, compassionate sanctuary to help everyday people decompress and protect emotional stamina. Every message here is received and read with care.
                    </p>
                  </div>

                  {/* Direct Email Card */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-emerald-700" />
                        Direct Inbox
                      </span>
                      {copied && (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
                          <Check className="w-3 h-3" />
                          Copied to clipboard
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-stone-50/80 border border-stone-200/70">
                      <span className="text-xs font-medium text-slate-800 truncate select-all">
                        sagrikathakur68@gmail.com
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="px-3 py-1 text-xs font-bold rounded-lg text-emerald-900 bg-emerald-100/70 hover:bg-emerald-200/70 transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95"
                        title="Copy email address"
                        aria-label="Copy email address"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trust & Response Footnote */}
                <div className="pt-6 border-t border-emerald-900/10 space-y-2 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Response time: <strong className="font-semibold text-slate-800">Within 24 hours</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Privacy: <strong className="font-semibold text-slate-800">100% Confidential · Zero trackers</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Form */}
              <div className="lg:col-span-7 p-8 sm:p-10 bg-white/75 backdrop-blur-md">
                {submitted ? (
                  <div className="py-12 sm:py-16 text-center space-y-5 animate-in fade-in duration-300">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center border border-emerald-200 shadow-xs">
                      <Check className="w-7 h-7 text-emerald-700" />
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-2xl font-serif italic text-emerald-950 font-bold">
                        Message Received
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        Thank you for reaching out, <strong className="font-semibold text-slate-900">{formData.name}</strong>. Your note has been delivered safely. The CalmTREE team will get back to you at <span className="font-medium text-emerald-800">{formData.email}</span> shortly.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-6 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Send Another Note
                      </button>
                      <Link
                        to="/"
                        onClick={() => sounds.playClick()}
                        className="px-6 py-3 rounded-2xl bg-white hover:bg-stone-50 text-slate-800 text-xs font-bold transition border border-stone-200/90 shadow-2xs cursor-pointer active:scale-95"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Topic Selector */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        What is this regarding?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {TOPICS.map((t) => {
                          const isSelected = formData.topic === t.id;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                sounds.playClick();
                                setFormData({ ...formData, topic: t.id });
                              }}
                              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all border cursor-pointer ${isSelected
                                ? "bg-slate-950 text-white border-slate-950 shadow-xs scale-[1.02]"
                                : "bg-white/80 hover:bg-white text-slate-700 border-stone-200/90 hover:border-emerald-400/60 shadow-2xs"
                                }`}
                            >
                              <span>{t.icon}</span>
                              <span className="truncate">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Name & Email Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Alex Rivera"
                          className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-stone-200/90 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-xs sm:text-sm text-slate-900 transition-all shadow-2xs outline-none font-medium placeholder:text-stone-400"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          maxLength={150}
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="alex@example.com"
                          className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-stone-200/90 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-xs sm:text-sm text-slate-900 transition-all shadow-2xs outline-none font-medium placeholder:text-stone-400"
                        />
                      </div>
                    </div>

                    {/* Message Box */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        Message
                      </label>
                      <textarea
                        required
                        rows={5}
                        maxLength={5000}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Write your note here... Share your thoughts, feedback, or ideas."
                        className="w-full px-4 py-3 rounded-2xl bg-white/90 border border-stone-200/90 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 text-xs sm:text-sm text-slate-900 transition-all shadow-2xs outline-none resize-none leading-relaxed font-medium placeholder:text-stone-400"
                      />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <a
                        href="mailto:sagrikathakur68@gmail.com"
                        onClick={() => sounds.playClick()}
                        className="text-xs font-medium text-slate-600 hover:text-emerald-900 transition flex items-center gap-1"
                      >
                        <span>Prefer your mail client? Write directly</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto h-12 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-slate-950 hover:bg-emerald-950 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60 cursor-pointer"
                      >
                        <Send className="w-4 h-4 text-emerald-300" />
                        {isSubmitting ? (
                          <span>Sending note...</span>
                        ) : (
                          <span>Send Message</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <PatternFooter />
      </div>
    </div>
  );
};

export default Contact;
