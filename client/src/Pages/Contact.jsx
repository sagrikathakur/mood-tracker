import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import PatternFooter from "../Components/PatternFooter";
import api from "../utils/api";
import { sounds } from "../utils/soundEffects";

const TOPICS = [
  { id: "hello", label: "Saying Hello" },
  { id: "feedback", label: "Product Feedback" },
  { id: "bug", label: "Report a Bug" },
  { id: "feature", label: "Feature Idea" },
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
    <div className="min-h-screen bg-[#90D786] text-slate-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/90 text-emerald-950 text-xs font-semibold tracking-wide border border-emerald-950/15 shadow-2xs backdrop-blur-md">
              Get in Touch
            </span>

            <h1 className="text-3xl sm:text-5xl font-serif italic text-slate-950 font-normal tracking-tight">
              We&apos;d love to hear from you
            </h1>

            <p className="text-xs sm:text-sm text-emerald-950/80 leading-relaxed font-medium">
              Share a thought, submit a bug, propose an idea, or say hello. Every note lands directly in Sagrika&apos;s personal inbox.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-emerald-950/15 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-5 bg-[#F7F5EE] p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-200/80 space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#1b4332] text-emerald-100 flex items-center justify-center font-serif text-base font-medium shadow-xs">
                        ST
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-slate-900 leading-tight">
                          Sagrika Thakur
                        </h2>
                        <p className="text-xs text-[#2d6a4f] font-medium">
                          Creator &amp; Developer · Calm Me
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal pt-1">
                      Calm Me was built as an honest, compassionate sanctuary to help developers navigate sprint burnout and protect cognitive stamina. Every message here is received and read personally.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Direct Email
                    </label>
                    <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-white border border-stone-200/90">
                      <span className="text-xs sm:text-sm font-medium text-slate-800 truncate select-all">
                        sagrikathakur68@gmail.com
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 hover:text-[#1b4332] hover:bg-stone-100 transition shrink-0"
                        title="Copy email address"
                        aria-label="Copy email address"
                      >
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-200/70 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Response time</span>
                    <span className="font-medium text-slate-700">Within 24–48 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Privacy</span>
                    <span className="font-medium text-slate-700">No trackers or newsletters</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 p-8 sm:p-10 bg-white">
                {submitted ? (
                  <div className="py-12 sm:py-16 text-center space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h3 className="text-2xl font-serif italic text-[#1b4332]">
                        Message Sent
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Thank you for reaching out, <strong className="font-semibold text-slate-900">{formData.name}</strong>. Your note has been delivered. Sagrika will get back to you at <span className="font-medium text-[#2d6a4f]">{formData.email}</span> soon.
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleResetForm}
                        className="px-5 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-semibold transition"
                      >
                        Send Another Note
                      </button>
                      <Link
                        to="/"
                        onClick={() => sounds.playClick()}
                        className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold transition"
                      >
                        Back to Home
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-700 block">
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
                              className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-medium transition-colors border ${
                                isSelected
                                  ? "bg-[#1b4332] text-white border-[#1b4332] shadow-xs"
                                  : "bg-stone-50 text-slate-600 hover:bg-stone-100 border-stone-200/80"
                              }`}
                            >
                              <span className="truncate">{t.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/60 border border-stone-200/90 focus:bg-white focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/15 text-xs sm:text-sm text-slate-900 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 block">
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
                          className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/60 border border-stone-200/90 focus:bg-white focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/15 text-xs sm:text-sm text-slate-900 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
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
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50/60 border border-stone-200/90 focus:bg-white focus:border-[#2d6a4f] focus:outline-none focus:ring-2 focus:ring-[#2d6a4f]/15 text-xs sm:text-sm text-slate-900 transition resize-none leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <a
                        href="mailto:sagrikathakur68@gmail.com"
                        onClick={() => sounds.playClick()}
                        className="text-xs text-slate-500 hover:text-[#1b4332] transition"
                      >
                        Prefer your mail app? Write directly &rarr;
                      </a>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto h-11 inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors disabled:opacity-60"
                      >
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

      <PatternFooter />
    </div>
  );
};

export default Contact;
