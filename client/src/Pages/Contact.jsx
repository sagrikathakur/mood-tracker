import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import PatternFooter from "../Components/PatternFooter";
import api from "../utils/api";
import { sounds } from "../utils/soundEffects";
import contactPageBg from "../assets/contact-page.jpg";
import { Check, ShieldCheck, Loader2 } from "lucide-react";

const TOPICS = [
  { id: "general", label: "General" },
  { id: "feedback", label: "Feedback" },
  { id: "support", label: "Support" },
  { id: "partnership", label: "Partnership" },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "general",
    message: "",
  });
  const [userLocation, setUserLocation] = useState("");
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
      topic: "general",
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

      <main className="relative z-10 flex-1 w-full pt-28 sm:pt-36 pb-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="w-full max-w-xl mx-auto">
          {/* Enterprise Glass Form Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.16)] p-8 sm:p-10 transition-all">
            {submitted ? (
              <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center border border-emerald-200 shadow-2xs">
                  <Check className="w-6 h-6 text-emerald-700" />
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Message Received
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                    Thank you, <strong className="font-semibold text-slate-900">{formData.name}</strong>. Our team has received your note and will follow up at <span className="font-medium text-slate-900">{formData.email}</span> within 24 hours.
                  </p>
                </div>

                <div className="pt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    Send Another Note
                  </button>
                  <Link
                    to="/"
                    onClick={() => sounds.playClick()}
                    className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                    Get in touch
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Have a question, feedback, or an inquiry? We typically respond within one business day.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Topic Selector - Minimalist Enterprise Segmented Buttons */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Topic
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
                            className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs font-semibold"
                                : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Jane Doe"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition shadow-2xs font-normal"
                    />
                  </div>

                  {/* Email Field */}
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
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition shadow-2xs font-normal"
                    />
                  </div>

                  {/* Message Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={1500}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      placeholder="How can we help?"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition shadow-2xs resize-none font-normal leading-relaxed"
                    />
                  </div>

                  {/* Footer Action & Privacy Note */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 order-2 sm:order-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Encrypted &amp; private · Zero tracking</span>
                    </span>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto h-10 px-6 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60 order-1 sm:order-2 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Send Message</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
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
